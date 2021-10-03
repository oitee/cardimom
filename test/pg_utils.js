 
let pgHost = process.env.TEST_POSTGRES_HOST;
let pgPort = process.env.TEST_POSTGRES_PORT;
let pgPassword = process.env.TEST_POSTGRES_PASSWORD;
let pgDB = process.env.TEST_POSTGRES_DB;
export default `postgres://postgres:${pgPassword}@${pgHost}:${pgPort}/${pgDB}`;