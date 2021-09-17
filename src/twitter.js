import Twitter from "twitter-lite";

export async function publishTweets(credentials, posts) {
  let listOfTweets = keep(posts, (post) => {
    let tweet = `New blog post by ${post.twitter_username}: ${post.title} ${post.link}`;
    if (tweet.length > 280) {
      tweet = `${post.twitter_username} posted ${post.link}`;
    }
    if (tweet.length > 280) {
      tweet = false;
    }
    return tweet;
  });
  await Promise.all(
    listOfTweets.map((tweetPost) => tweet(credentials, tweetPost))
  );
}

async function tweet(credentials, tweetPost) {
  const client = new Twitter({
    subdomain: "api", // "api" is the default (change for other subdomains)
    version: "1.1", // version "1.1" is the default (change for other subdomains)
    consumer_key: credentials.consumerKey, // from Twitter.
    consumer_secret: credentials.consumerSecret, // from Twitter.
    access_token_key: credentials.accessTokenKey, // from your User (oauth_token)
    access_token_secret: credentials.accessTokenSecret, // from your User (oauth_token_secret)
  });
  try {
    console.log(`Posting this tweet: ${tweetPost}`);
    await client.post("statuses/update", {
      status: tweetPost,
      auto_populate_reply_metadata: true
    });
  } catch (e) {
    console.error(
      `Error in posting this tweet: ${tweetPost}. Error message: ${e}`
    );
    throw e;
  }
}

function keep(list, mapper) {
  let reducer = (acc, entry) => {
    let returnValue = mapper(entry);
    if (returnValue) {
      acc.push(returnValue);
    }
    return acc;
  };
  return list.reduce(reducer, []);
}
