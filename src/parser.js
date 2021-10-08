import { JSDOM } from "jsdom";
import * as utils from "./utilities.js";

/**
 * Parses an xml feed passed to it and returns an array of objects representing the requisite properties of each post
 * @param {string} xml
 * @returns {[object]}
 */
export async function parse(lastUpdated, xml) {
  const parsed = new JSDOM(xml, {
    contentType: "text/xml",
  });
  let version = parsed.window.document.getElementsByTagName("rss");
  let allposts = [];
  if (version.length != 0) {
    allposts = await parseRSS(lastUpdated, parsed);
  } else {
    version = parsed.window.document.getElementsByTagName("feed");
    if (version.length != 0) {
      allposts = await parseAtom(lastUpdated, parsed);
    }
  }
  return allposts;
}

async function parseRSS(lastUpdated, parsed) {
  const DATE_TAGS_RSS = ["pubDate"];
  const LINK_TAGS_RSS = ["link"];
  const TITLE_TAGS_RSS = ["title"];
  const CONTENT_TAGS_RSS = ["description"];

  let listOfItems = parsed.window.document.getElementsByTagName("item");
  //for the first time, the database will be empty and lastUpdated will be == null
  if (!lastUpdated) {
    //new Date() creates a new date object;
    //Date.parse() returns date object in milli seconds
    lastUpdated = 1609439400000; // Date: Jan 1, 2021
  }
  let allPosts = [];
  for (let i = 0; i < listOfItems.length; i++) {
    const tagFinder = (tag) => getElementText(listOfItems[i], tag);
    const extractorFn = (tags) => utils.some(tags, tagFinder);

    let currentPost = {};
    let date = extractorFn(DATE_TAGS_RSS);
    let dateStd = convertDate(date);
    if (!dateStd || typeof dateStd !== "number" || dateStd < lastUpdated) {
      dateStd = false;
    }
    let title = extractorFn(TITLE_TAGS_RSS);
    if (!title || typeof title !== "string") {
      title = false;
    }

    let content = extractorFn(CONTENT_TAGS_RSS);
    if (!content || typeof content !== "string") {
      content = false;
    }
    let link = extractorFn(LINK_TAGS_RSS);
    let linkStd = confirmLink(link);
    if (linkStd && content && title && dateStd) {
      currentPost.title = title;
      currentPost.date = dateStd;
      currentPost.content = content;
      currentPost.link = linkStd;
      allPosts.push(currentPost);
    }
  }
  return allPosts;
}

async function parseAtom(lastUpdated, parsed) {
  const DATE_TAGS_ATOM = ["updated", "published"];
  const LINK_TAGS_ATOM = ["id"];
  const TITLE_TAGS_ATOM = ["title"];
  const CONTENT_TAGS_ATOM = ["content", "summary"];

  let listOfEntries = parsed.window.document.getElementsByTagName("entry");
  if (!lastUpdated) {
    lastUpdated = 1609439400000; // Date: Jan 1, 2021
  }
  let allPosts = [];
  for (let i = 0; i < listOfEntries.length; i++) {
    const tagFinder = (tag) => getElementText(listOfEntries[i], tag);
    const extractorFn = (tags) => utils.some(tags, tagFinder);
    let currentPost = {};

    let date = extractorFn(DATE_TAGS_ATOM);
    let dateStd = convertDate(date);
    if (!dateStd || typeof dateStd !== "number" || dateStd < lastUpdated) {
      dateStd = false;
    }

    let title = extractorFn(TITLE_TAGS_ATOM);
    if (!title || typeof title !== "string") {
      title = false;
    }

    let content = extractorFn(CONTENT_TAGS_ATOM);
    if (!content || typeof content !== "string") {
      content = false;
    }

    let link = extractorFn(LINK_TAGS_ATOM);
    let linkStd = confirmLink(link);
    if (linkStd && title && content && dateStd) {
      currentPost.title = title;
      currentPost.date = dateStd;
      currentPost.content = content;
      currentPost.link = linkStd;
      allPosts.push(currentPost);
    }
  }
  return allPosts;
}

function getElementText(listOfElements, tag) {
  if (listOfElements.getElementsByTagName(tag).length != 0) {
    return listOfElements.getElementsByTagName(tag)[0].innerHTML;
  }
  return;
}

function convertDate(str) {
  let dateMilli = Date.parse(str);
  return dateMilli;
}

function confirmLink(str) {
  let linkStd;
  try {
    let urlObject = new URL(str);
    let protocol = urlObject.protocol;
    if (protocol != "https:" && protocol != "http:") {
      return false;
    }
    let origin = urlObject.origin;
    let path = urlObject.pathname;
    linkStd = origin + path;
  } catch (e) {
    return false;
  }
  return linkStd;
}
