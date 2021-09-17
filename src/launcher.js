import { readFileSync } from "fs";
import * as fetcher from "./fetcher.js";
import * as config_reader from "./config_reader.js";
import * as db from "./post_db.js";
import * as twitter from "./twitter.js";

let config = JSON.parse(readFileSync('blog_spec.json', "utf8"));
let listOfBlogs = config_reader.reader(config);

let twitterCredentials = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY, 
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET, 
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY, 
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
}

db.poolStart(process.env.DATABASE_URL);
let listOfPosts = await Promise.all(listOfBlogs.map(fetcher.findPosts));
listOfPosts = listOfPosts.flatMap(post => post);


db.selectNewPosts(listOfPosts)
  .then(db.addNewPosts)
  .then(newPosts => twitter.publishTweets(twitterCredentials, newPosts))
  .then(db.poolEnd);
