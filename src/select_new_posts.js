//const { Client } = require("pg");
import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  user: "postgres",
  password: "test123",
  host: "localhost",
  post: 5432,
  database: "cardimom",
});
export async function selectNewPosts(listOfBlogs) {
  let allLinks = listOfBlogs.flatMap((blog) =>
    blog.posts.map((post) => post.link)
  );
  let res;
  try {
    await client.connect();
    res = await client.query("select link from posts where link = any ($1)", [
      allLinks,
    ]);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
  let existingLinks = new Set(res.rows.map((row) => row.link));
  return listOfBlogs
    .map((blog) => {
      let validPosts = blog.posts.filter((post) => !existingLinks.has(post.link));
      blog.posts = validPosts;
      return blog;
    })
    .filter((blog) => blog.posts.length != 0);
}
