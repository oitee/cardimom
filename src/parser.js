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
    let link = getElementText(listOfItems[i], "link");
    let linkStd = confirmLink(link);
    if(linkStd != ""){
      currentPost.link = linkStd;
      allPosts.push(currentPost);
    }
    
    
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
    let link = getElementText(listOfEntries[i], "id");
    let linkStd = confirmLink(link);
    if(linkStd != ""){
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

function convertDate(str){
  let dateMilli = Date.parse(str);
  return dateMilli;  
}

function confirmLink(str){
  let linkStd = "";
  try{
    let urlObject = new URL(str);
    let protocol = urlObject.protocol;
    if(protocol != "https:" && protocol != "http:"){
      console.log("protocol not supported:" + str);
      return linkStd;
    }
    let origin = urlObject.origin;
    let path = urlObject.pathname;
    linkStd = origin + path;
  }
  catch(e){}
  return linkStd;
}


