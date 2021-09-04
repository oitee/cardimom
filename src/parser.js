import { JSDOM } from "jsdom";

export function parse(xml) {
  const parsed = new JSDOM(xml, {
    contentType: "text/xml",
  });
  let version = parsed.window.document.getElementsByTagName("rss");
  let allposts = [];
  if (version.length != 0) {
    allposts = parseRSS(parsed);
  } else {
    version = parsed.window.document.getElementsByTagName("feed");
    if (version.length != 0) {
      allposts = parseAtom(parsed);
    }
  }
  return allposts;
}

function parseRSS(parsed) {
  let listOfItems = parsed.window.document.getElementsByTagName("item");
  let allPosts = [];
  for (let i = 0; i < listOfItems.length; i++) {
    let currentPost = {};
    currentPost.title = getElementText(listOfItems[i], "title");
    let date = getElementText(listOfItems[i], "pubDate");
    let dateStd = convertDate(date);
    currentPost.date = dateStd;
    currentPost.content = getElementText(listOfItems[i], "description");
    currentPost.link = getElementText(listOfItems[i], "link");
    allPosts.push(currentPost);
  }
  return allPosts;
}

function parseAtom(parsed) {
  let listOfEntries = parsed.window.document.getElementsByTagName("entry");
  let allPosts = [];
  for (let i = 0; i < listOfEntries.length; i++) {
    let currentPost = {};
    currentPost.title = getElementText(listOfEntries[i], "title");
    let date = getElementText(listOfEntries[i], "published");
    if (!date) {
      date = getElementText(listOfEntries[i], "updated");
    }
    let dateStd = convertDate(date);
    currentPost.date = dateStd;
    let content = getElementText(listOfEntries[i], "content");
    if (!content) {
      content = getElementText(listOfEntries[i], "summary");
    }
    currentPost.content = content;
    currentPost.link = getElementText(listOfEntries[i], "id");
    allPosts.push(currentPost);
  }
  return allPosts;
}

function getElementText(listOfElements, tag) {
  if (listOfElements.getElementsByTagName(tag).length != 0) {
    return listOfElements.getElementsByTagName(tag)[0].innerHTML;
  }
  return;
}

function convertDate(str){
  let dateMilli = Date.parse(str);
  return dateMilli;  
}


