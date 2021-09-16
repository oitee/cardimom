import { readFileSync } from "fs";
import * as fetcher from "../src/fetcher.js";
import * as config_reader from "../src/config_reader.js";
import * as db from "../src/post_db.js";
import * as twitter from "../src/twitter.js";
import pg from "pg";
import * as assert from "assert";

//import jest
//write runner: to replicate launcher
//write a config with another blog site.
//write filter
//write a function for mock tweets
//test1: pass config to runner, it should return an array of new Posts.
//pass array to mock tweets, it will pass an array (author + title+ link). Convert to set.
//do the test. assert.ok - both has and !has
// idempotem run- pass config to runner, and then to mock. This should be empty array
//do the test. assert.ok- all empty
//import pg
//beforeall: establish connection (with testdb), delete all
//afterall: deleteall, end connection, poolend
//
const { Client } = pg;
let client = new Client({
  connectionString:
    "postgres://postgres:test123@localhost:5432/cardimom_test_alt",
});

async function deleteAll() {
  try {
    await client.query("delete from posts");
  } catch (e) {
    console.error(e);
  }
}
async function deleteOne(){
    try{
        await client.query(delete from posts limit )
    }
}
async function runner(config) {
  let listOfBlogs = config_reader.reader(config);
  let listOfPosts = await Promise.all(listOfBlogs.map(fetcher.findPosts));
  listOfPosts = listOfPosts.flatMap((post) => post);

  let newPosts = await db.selectNewPosts(listOfPosts).then(db.addNewPosts);
  return createMockTweets(newPosts);
}

function createMockTweets(listOfPosts) {
  return new Set(listOfPosts.map((post) => post.title + post.twitter_username));
}

let config =
[
  {
    link: "https://erikbern.com/index.xml",
    filter: {
      includes_any: ["team"],
      excludes_all: ["parable"],
    },
    twitter_username: "@testErik",
  },
  {
    link: "https://blog.heroku.com/feed",
    filter: {
      includes_any: ["salesforce "],
      excludes_all: ["Xplenty"],
    },
    twitter_username: "@testHeroku",
  }
];

// ==========================================================


test("empty database test for two alternate blogs", async () => {
   let setOfTweets = await runner(config);
   assert.ok(setOfTweets.has("What is the right level of specialization? For data teams and anyone else.@testErik"));
   assert.ok(setOfTweets.has("What's Erik up to?@testErik"));
   assert.ok(!setOfTweets.has("Building a data team at a mid-stage startup: a short story@Erik"));
   assert.ok(setOfTweets.has("Enhancing Security - MFA with More Options, Now Available for All Heroku Customers@testHeroku"));
   assert.ok(setOfTweets.has("Announcing Larger Heroku Postgres Plans: More Power, More Storage@testHeroku"));
   assert.ok(!setOfTweets.has("Salesforce Integration: Xplenty and Heroku Connect@testHeroku"));
})


test("idempotent run", async () => {
    let setOfTweets = await runner(config);
    assert.ok(setOfTweets.size == 0);
  });
// ==========================================================

beforeAll(async () => {
  await client.connect();
  db.poolStart("postgres://postgres:test123@localhost:5432/cardimom_test_alt");
  await deleteAll();
});

afterAll(async () => {
    await deleteAll();
    await client.end();
    await db.poolEnd();
}
);