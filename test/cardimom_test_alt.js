import * as fetcher from "../src/fetcher.js";
import * as config_reader from "../src/config_reader.js";
import * as db from "../src/post_db.js";
import pg from "pg";
import * as assert from "assert";


const { Client } = pg;
let client = new Client({
  connectionString:
    "postgres://postgres:test123@localhost:5432/cardimom_test_alt",
    // `postgres://postgres:postgres@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/postgres`,
});

async function deleteAll() {
  try {
    await client.query("delete from posts");
  } catch (e) {
    console.error(e);
  }
}

async function deleteLatestPost(){
  try{
    let res = await client.query("SELECT MAX(published_at) FROM posts");
    let lastPublished = res.rows[0].max;
    await client.query("DELETE FROM posts WHERE published_at = ($1)", [lastPublished]);
    let newPostDate = new Date (Date.parse(lastPublished) - 1000);
    await client.query("UPDATE posts SET posted_at = ($1)", [newPostDate]);
  }
  catch(e){
    console.error(e);
  }
}

async function runner(config) {
  let listOfBlogs = config_reader.reader(config);
  let lastUpdated = await db.lastUpdated();
  let listOfPosts = await Promise.all(listOfBlogs.map(blog => fetcher.findPosts(lastUpdated, blog)));
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
  },
  {
    link: "https://mourjo.me/blog/feed.xml",
    filter: {
        includes_any: [
            "engineering", "computer"
        ],
        excludes_all: ["Load Shedding in Clojure", "Rastapopoulos"]
    },
    twitter_username: "@mourjo_sen"
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

test("test after deleting most recent post", async () =>{
  await deleteLatestPost();
  let setOfTweets = await runner(config);
  assert.ok(setOfTweets.size == 1);
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