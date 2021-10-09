import * as fetcher from "./fetcher.js";
import * as config_reader from "./config_reader.js";
import { readFileSync } from "fs";

let sampleConfig = [
  {
    link: "https://hacks.mozilla.org/feed/",
    filter: {
      includes_any: [],
      excludes_all: [],
    },
    twitter_username: "@mozilla",
  },
  {
    link: "https://otee.dev/feed.xml",
    filter: {
      includes_any: [],
      excludes_all: [],
    },
    twitter_username: "@oteecodes",
  },
  {
    link: "https://engineering.cerner.com/index.xml",
    filter: {
      includes_any: [],
      excludes_all: [],
    },
    twitter_username: "@CernerEng",
  },
  {
    link: "https://www.cloudbees.com/blog.xml",
    filter: {
      includes_any: [],
      excludes_all: [],
    },
    twitter_username: "@CloudBees",
  },

  // {
  //   link: "",
  //   filter: {
  //     includes_any: [],
  //     excludes_all: [],
  //   },
  //   twitter_username: "",
  // },
];

if (process.env.CONFIG_FILE_PATH) {
  console.log(`Reading config from file: ${process.env.CONFIG_FILE_PATH}`);
  sampleConfig = JSON.parse(readFileSync(process.env.CONFIG_FILE_PATH, "utf8"));
} else {
  console.log(`Reading sample config`);
}

const listOfBlogs = config_reader.reader(sampleConfig);

export async function trialRun() {
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
    let result = mapper(entry);
    if (result) {
      acc.push(result);
    }
    return acc;
  };
  return list.reduce(reducer, []);
}


export function some(list, matcher) {
  for (let i = 0; i < list.length; i++) {
    let result = matcher(list[i]);
    if (result) {
      return result;
    }
  }
  return null;
}

export function removeAll(inputString, keywords) {
  return keywords.reduce((acc, key) => acc.replaceAll(key, ""), inputString);
}
