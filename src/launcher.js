import * as feedParser from "./parser.js";
import * as fetcher from "./fetcher.js";
import * as config_reader from "./config_reader.js";
import * as filter from "./filter.js";



let crudeListOfBlogs = config_reader.reader('blog_spec.json');
let listOfBlogs = JSON.parse(crudeListOfBlogs);

for (let blog of listOfBlogs){
  let url = blog.link;
  let feedText = await fetcher.fetcher(url);
  if (feedText != undefined) {
    try {
       let parsedBlogs = feedParser.parse(feedText);
       blog.posts = filter.select(parsedBlogs, blog.filter.includes_any, blog.filter.excludes_all);  
      }
      catch (e) {
       console.error(url);
       console.error(e);
     }
    }
}



for(let blog of listOfBlogs){
  for(let filtered of blog.posts){
    console.log(filtered.title);
  }
}
//console.log(listOfBlogs[0].parsed[0].content);

// for (let i = 0; i < urlArr.length; i++) {
//   let currentURL = urlArr[i];
//   let feedText = await fetcher.fetcher(currentURL);
//   if (feedText != undefined) {
//     try {
//       let feedBlogs = feedParser.parse(feedText);
//       // if (feedBlogs.content != undefined) {
//       //   feedBlogs.content.substring(0, 10);
//       // }
//       feedBlogs = feedBlogs.map((val) => {
//         if (val.content != undefined) {
//           val.content = val.content.substring(0, 10);
//         }
//         return val;
//       });
//       console.log(currentURL);
//       console.table(feedBlogs);
//       console.log("\n");
//       console.log();
//       console.log();
//       console.log();
//     } catch (e) {
//       console.error(currentURL);
//       console.error(e);
//     }
//   }
// }

