import * as config_reader from "../src/config_reader.js";
import * as fetcher from "../src/fetcher.js";
import * as db from "../src/post_db.js";
import * as assert from "assert";
import * as pgUtils from "./pg_utils.js";

/*
To run this test, the database on local host needs to be created as follows:

create database cardimom_test;
\connect cardimom_test;
drop table if exists posts;
create table if not exists posts (
    link text primary key,
    author text not null,
    posted_at timestamp with time zone,
    published_at timestamp with time zone
);

*/

import pg from "pg";
const { Client } = pg;


const client = new Client({
  connectionString: pgUtils.connectionString,
});

async function deleteAllPosts() {
  try {
    await client.query("delete from posts");
  } catch (e) {
    console.error(e);
  }
}

async function runner(config) {
  let listOfBlogs = config_reader.reader(config);
  let lastUpdated = await db.lastUpdated();
  let listOfPosts = await Promise.all(listOfBlogs.map(blog => fetcher.findPosts(lastUpdated, blog)));
  listOfPosts = listOfPosts.flatMap((post) => post);

  listOfPosts = await db
    .selectNewPosts(listOfPosts)
    .then(db.addNewPosts);
  return createMockTweets(listOfPosts);
}

function createMockTweets(listOfPosts) {
  return new Set(listOfPosts.map((post) => post.title + post.twitter_username));
}

// ==========================================================

let config = [
  {
    link: "https://otee.dev/feed.xml",
    filter: {
      includes_any: ["implement"],
      excludes_all: ["LISP"],
    },
    twitter_username: "@oteecodes",
  },
];

test("empty database test", async () => {
  await deleteAllPosts();
  let setOfTweets = await runner(config);
  assert.ok(setOfTweets.has("Cache Replacement@oteecodes"));
  assert.ok(setOfTweets.has("Implementing Graphs@oteecodes"));
  assert.ok(setOfTweets.has("Implementing Binary Search@oteecodes"));
  assert.ok(setOfTweets.has("Implementing Stacks@oteecodes"));
  assert.ok(setOfTweets.has("Valid Parenthesis@oteecodes"));
});

test("idempotent run", async () => {
  let setOfTweets = await runner(config);
  assert.ok(setOfTweets.size == 0);
});

config = [
  {
    link: "https://otee.dev/feed.xml",
    filter: {
      includes_any: ["implement"],
      excludes_all: ["LISP"],
    },
    twitter_username: "@oteecodes",
  },
  {
    link: "https://otee.dev/feed.xml",
    filter: {
      includes_any: ["implement"],
      excludes_all: ["LISP"],
    },
    twitter_username: "@oteecodes",
  },
  {
    link: "https://otee.dev/feed.xml",
    filter: {
      includes_any: ["implement"],
      excludes_all: ["LISP"],
    },
    twitter_username: "@oteecodes",
  },
];

test("duplicated config-- empty database test", async () => {
  await deleteAllPosts();
  let setOfTweets = await runner(config);
  assert.ok(setOfTweets.has("Cache Replacement@oteecodes"));
  assert.ok(setOfTweets.has("Implementing Graphs@oteecodes"));
  assert.ok(setOfTweets.has("Implementing Binary Search@oteecodes"));
  assert.ok(setOfTweets.has("Implementing Stacks@oteecodes"));
  assert.ok(setOfTweets.has("Valid Parenthesis@oteecodes"));
});

test("duplicated config-- idempotent run", async () => {
  let setOfTweets = await runner(config);
  assert.ok(setOfTweets.size == 0);
});
// ==========================================================

beforeAll(async () => {
  await client.connect();
  await pgUtils.createPostsTable();
  db.poolStart(
    pgUtils.connectionString, false);
});

afterAll(async () => {
  await deleteAllPosts();
  await db.poolEnd();
  await client.end();
});
