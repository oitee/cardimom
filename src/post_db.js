import pg from "pg";
const { Pool } = pg;

let pool;

/**
 * Creates a new Pool object by using the databaseURL passed to it
 * @param {string} databaseURL
 */
export function poolStart(databaseURL, sslSupported = true) {
  const poolOptions = {
    connectionString: databaseURL, // format: postgres://user:password@host:5432/database [https://node-postgres.com/api/client]
    connectionTimeoutMillis: 10000, // [https://node-postgres.com/api/pool]
    idleTimeoutMillis: 60000,
    max: 2
  };

  if (sslSupported) {
    poolOptions.ssl = { rejectUnauthorized: false };
  }

  pool = new Pool(poolOptions);
}

/**
 * Ends the pool connection
 */
export async function poolEnd() {
  await pool.end();
}

/**
 * Accepts an array of posts(objects) and checks with the list of posts already existing in the database,
 * by comparing whether the `post.link` property of each post object is present in the `link` column of the database.
 * Returns an array of posts(objects) that are not present in the database
 * @param {[object]} listOfPosts
 * @returns {[object]}
 */
export async function selectNewPosts(listOfPosts) {
  let allLinks = listOfPosts.map((post) => post.link);
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
  let newPosts = listOfPosts.filter((post) => !existingLinks.has(post.link));
  return newPosts;
}

/**
 * Accepts an array of posts (objects) as parameters and adds their requisite details to the database
 * @param {[object]} listOfPosts
 * @param {[string]} includes
 * @param {[string]} excludes
 * @returns {[object]}
 */
export async function addNewPosts(postList) {
  const client = await pool.connect();
  try {
    for (let post of postList) {
      await client.query(
        "insert into posts values($1, $2, current_timestamp, to_timestamp($3))",
        [post.link, post.twitter_username, post.date / 1000]
      );
    }
  } catch (e) {
    console.error(e);
  } finally {
    client.release();
  }
  return postList;
}
/**
 * Returns the most recent timestamp from the `posted_at` column of the database
 * @returns {number}
 */
export async function lastUpdated() {
  const client = await pool.connect();
  let res;
  try {
    res = await client.query("select max(posted_at) from posts");
  } catch (e) {
    console.error(e);
  } finally {
    client.release();
  }
  return Date.parse(res.rows[0].max);
}
