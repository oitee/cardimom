import { JSDOM } from "jsdom";
import * as db from "./post_db.js";

export async function parse(xml) {
  const parsed = new JSDOM(xml, {
    contentType: "text/xml",
  });
  let version = parsed.window.document.getElementsByTagName("rss");
  let allposts = [];
  if (version.length != 0) {
    allposts = await parseRSS(parsed);
  } else {
    version = parsed.window.document.getElementsByTagName("feed");
    if (version.length != 0) {
      allposts = await parseAtom(parsed);
    }
  }
  return allposts;
}

async function parseRSS(parsed) {
  let listOfItems = parsed.window.document.getElementsByTagName("item");
  let lastUpdated = await db.lastUpdated();
  //for the first time, the database will be empty and lastUpdated will be === null
  if(lastUpdated === null){
    //new Date() creates a new date object; 
    //Date.parse() returns date object in milli seconds
    //ToDo:lastUpdated = Date.parse(new Date());
    lastUpdated = 1609439400000;// Date: Jan 1, 2021
  }
  let allPosts = [];
  for (let i = 0; i < listOfItems.length; i++) {
    let currentPost = {};
    
    let date = getElementText(listOfItems[i], "pubDate");
    let dateStd = convertDate(date);
    if(dateStd > lastUpdated){
    currentPost.date = dateStd;
    currentPost.title = getElementText(listOfItems[i], "title");
    currentPost.content = getElementText(listOfItems[i], "description");
    let link = getElementText(listOfItems[i], "link");
    let linkStd = confirmLink(link);
    if(linkStd != ""){
      currentPost.link = linkStd;
      allPosts.push(currentPost);
    }
  }
    
    
  }
  console.log(allPosts);
  return allPosts;
}

async function parseAtom(parsed) {
  let listOfEntries = parsed.window.document.getElementsByTagName("entry");
  let lastUpdated = await db.lastUpdated();
  if(lastUpdated === null){
    //ToDo:lastUpdated = Date.parse(new Date());
    lastUpdated = 1609439400000;// Date: Jan 1, 2021
  }
  let allPosts = [];
  for (let i = 0; i < listOfEntries.length; i++) {
    let currentPost = {};
    
    let date = getElementText(listOfEntries[i], "published");
    if (!date) {
      date = getElementText(listOfEntries[i], "updated");
    }
    let dateStd = convertDate(date);
    if(dateStd > lastUpdated){

    
      currentPost.date = dateStd;
      currentPost.title = getElementText(listOfEntries[i], "title");
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


