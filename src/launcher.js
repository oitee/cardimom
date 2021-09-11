import { readFileSync } from "fs";
import * as fetcher from "./fetcher.js";
import * as config_reader from "./config_reader.js";
import * as newPosts from "./post_db.js";
import * as twitter from "./twitter.js";

let config = JSON.parse(readFileSync('blog_spec.json', "utf8"));
let listOfBlogs = config_reader.reader(config);
let listOfPosts = await Promise.all(listOfBlogs.map(fetcher.findPosts));
listOfPosts = listOfPosts.flatMap(post => post);

newPosts.poolStart(process.env.DATABASE_URL);
newPosts.selectNewPosts(listOfPosts)
  .then(newPosts.addNewPosts)
  .then(twitter.publishTweets)
  .then(newPosts.poolEnd);
