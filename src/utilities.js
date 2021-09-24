import * as fetcher from "./fetcher.js";
import * as config_reader from "./config_reader.js";

const sampleConfig = [
  {
    link: "https://hacks.mozilla.org/feed/",
    filter: {
      includes_any: ["javascript", "typescript"],
      excludes_all: [],
    },
    twitter_username: "@Mozilla",
  },
];
const listOfBlogs = config_reader.reader(sampleConfig);

async function trialRun() {
  try {
    let lastUpdated = null;
    let listOfPosts = await Promise.all(
      listOfBlogs.map((blog) => fetcher.findPosts(lastUpdated, blog))
    );
    listOfPosts = listOfPosts.flatMap((post) => post);

    mockTweets(listOfPosts);
  } catch (e) {
    console.error(`Something went wrong: ${e}`);
  }
  console.log("Finished reading blogs");
}

export function mockTweets(posts) {
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
  listOfTweets.map((tweetPost) => console.log(tweetPost));
}

export function keep(list, mapper) {
  let reducer = (acc, entry) => {
    let returnValue = mapper(entry);
    if (returnValue) {
      acc.push(returnValue);
    }
    return acc;
  };
  return list.reduce(reducer, []);
}

// await trialRun();
