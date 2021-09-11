import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // format: postgres://user:password@host:5432/database [https://node-postgres.com/api/client]
  connectionTimeoutMillis: 10000, // [https://node-postgres.com/api/pool]
  idleTimeoutMillis: 60000,
  max: 2
});

export async function poolEnd(){
  await pool.end();
}

export async function selectNewPosts(listOfPosts) {
  let allLinks =  listOfPosts.map(post => post.link);
  let res;
  const client = await pool.connect();
  try {
    res = await client.query("select link from posts where link = any ($1)", [
      allLinks,
    ]);
  } catch (e) {
    console.error(e);
  } finally {
    client.release();
  }
  let existingLinks = new Set(res.rows.map((row) => row.link));
  let newPosts = listOfPosts.filter(post => !existingLinks.has(post.link));
  return newPosts;
}


export async function addNewPosts(postList) {
  const client = await pool.connect();
  try {
    for(let post of postList){
      await client.query(
        "insert into posts values($1, $2, current_timestamp, to_timestamp($3))",
        [post.link, post.twitter_username, post.date/1000]//ToDo: check if this can be done with one insert query 
      );
    }
  } catch (e) {
    console.error(e);
  } finally {
    client.release();
  }
  return postList;
}