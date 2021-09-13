import Twitter from "twitter-lite";

export async function publishTweets(posts) {}

async function tweet() {
  const client = new Twitter({
    subdomain: "api", // "api" is the default (change for other subdomains)
    version: "1.1", // version "1.1" is the default (change for other subdomains)
    consumer_key: "u1UAUa5QGoFOYZVUxznYl3JCY", // from Twitter.
    consumer_secret: "eHWyNYECiC1rEeC7SKlDRkFB9V1fCZ8hDH4nWRPBonfGza1IeJ", // from Twitter.
    access_token_key: "1425387860111204356-MJe3ZhYleBavjOwh8U3slhBiXphsfJ", // from your User (oauth_token)
    access_token_secret: "q1uhpVSk1pMCeJpAy1YDClnvOCqsTdPJaV6a7QLHU8P4E", // from your User (oauth_token_secret)
  });

//   await client.post("statuses/update", {
//     status: "Hello World! Stay tuned, while I get ready to publish interesting blog posts on JavaScript and much more!",
//     auto_populate_reply_metadata: true,
//   });
}
await tweet();
