import fetch from "node-fetch";
import * as feedParser from "./parser.js";
import * as filter from "./filter.js"

export async function findPosts(blog){//rename
  let listOfPosts = [];
  let url = blog.link;
  let feedText = await fetcher(url);
  if (feedText !== undefined) {
    try {
       listOfPosts = await feedParser.parse(feedText);
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




async function fetcher(url) {
  try {
    const response = await fetch(url, {headers: { 'Content-Type': 'application/xml' }, timeout: 5000, redirect: 'error'});
    return await response.text();
  } catch (e) {}
}

