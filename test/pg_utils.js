import pg from "pg";

let pgHost = process.env.TEST_POSTGRES_HOST;
let pgPort = process.env.TEST_POSTGRES_PORT;
let pgPassword = process.env.TEST_POSTGRES_PASSWORD;
let pgDB = process.env.TEST_POSTGRES_DB;

export let connectionString = `postgres://postgres:${pgPassword}@${pgHost}:${pgPort}/${pgDB}`;
export async function createPostsTable() {
  const { Client } = pg;
  const client = new Client({
    connectionString: connectionString,
  });
  try {
    await client.connect();
    await client.query(`drop table if exists posts;
    create table if not exists posts (
        link text primary key,
        author text not null,
        posted_at timestamp with time zone,
        published_at timestamp with time zone
    );`);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
