import * as feedParser from "./parser.js";
import * as fetcher from "./fetcher.js";
import * as config_reader from "./config_reader.js";
import * as filter from "./filter.js";
import * as newPosts from "./post_db.js";
import * as twitter from "./twitter.js";

let listOfBlogs = config_reader.reader('blog_spec.json');

async function insertPosts(blog){
  let listOfPosts = [];
  let url = blog.link;
  let feedText = await fetcher.fetcher(url);
  if (feedText !== undefined) {
    try {
       listOfPosts = feedParser.parse(feedText);
       listOfPosts.map(post => {
         post.twitter_username = blog.twitter_username;
         post.filter = blog.filter;
         post.blog = blog.link;
       })
       listOfPosts = filter.select(listOfPosts, blog.filter.includes_any, blog.filter.excludes_all);
       return listOfPosts;  
      }
      catch (e) {
       console.error(url);
       console.error(e);
     }
    }
    return [];
}

let listOfPosts = await Promise.all(listOfBlogs.map(insertPosts));
listOfPosts = listOfPosts.flatMap(post => post);

newPosts.selectNewPosts(listOfPosts)
  .then(newPosts.addNewPosts)
  .then(twitter.publishTweets)
  .then(newPosts.poolEnd);
