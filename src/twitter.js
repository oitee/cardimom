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
    consumer_key: credentials.consumer_key, // from Twitter.
    consumer_secret: credentials.consumer_secret, // from Twitter.
    access_token_key: credentials.access_token_key, // from your User (oauth_token)
    access_token_secret: credentials.access_token_secret, // from your User (oauth_token_secret)
  });
  try {
    if (process.env.DRY_RUN) {
      console.log(`Not tweeting due to DRY_RUN setting: ${tweetPost}`);
    } else {
      console.log(`Posting this tweet: ${tweetPost}`);
      await client.post("statuses/update", {
        status: tweetPost,
        auto_populate_reply_metadata: true,
      });
    }
  } catch (e) {
    if ("errors" in e) {
      // Twitter API error
      if (e.errors[0].code === 88)
        // rate limit exceeded
        console.log(
          "Rate limit will reset on",
          new Date(e._headers.get("x-rate-limit-reset") * 1000)
        );
      else {
        // some other kind of error, e.g. read-only API trying to POST
        console.error(
          `Error in posting this tweet: ${tweetPost}. Error message: ${JSON.stringify(e)}`
        );
      }
    } else {
      console.error(`Unrecognised error: ${e}`);
    }
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
