// const { Client } = require("pg");
import pkg from "pg";
const { Client } = pkg;
const client = new Client({
  user: "postgres",
  password: "test123",
  host: "localhost",
  post: 5432,
  database: "cardimom",
});

export async function addNewPosts(blogList) {
  try {
    await client.connect();
    for (let blog of blogList) {
      for (let post of blog.posts) {
        await client.query(
          "insert into posts values($1, $2, current_timestamp, to_timestamp($3))",
          [post.link, blog.twitter_username, post.date]//ToDo: check if this can be done with one insert query 
        );
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

