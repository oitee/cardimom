import { readFileSync } from "fs";
import * as fetcher from "./fetcher.js";
import * as config_reader from "./config_reader.js";
import * as db from "./post_db.js";
import * as twitter from "./twitter.js";

const config = JSON.parse(readFileSync("blog_spec.json", "utf8"));
const listOfBlogs = config_reader.reader(config);

const twitterCredentials = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
};

db.poolStart(process.env.DATABASE_URL);

async function launch() {
  console.log("Starting to read blogs");
  try {
    let lastUpdated = await db.lastUpdated();
    let listOfPosts = await Promise.all(
      listOfBlogs.map((blog) => {
        let author = blog.twitter_username;
        return fetcher.findPosts(lastUpdated[author] || lastUpdated['__overall_max'], blog);
      })
    );
    listOfPosts = listOfPosts.flatMap((post) => post);

     await db.selectNewPosts(listOfPosts)
      .then(db.addNewPosts)
      .then((newPosts) => twitter.publishTweets(twitterCredentials, newPosts))
      .then(() => console.log("Finished reading blogs"));
  } catch (e) {
    console.error(`Something went wrong: ${e}`);
  }
}
await launch();
await db.poolEnd();
// setInterval(launch, 60 * 60 * 1000);
