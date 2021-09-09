import * as feedParser from "./parser.js";
import * as fetcher from "./fetcher.js";
import * as config_reader from "./config_reader.js";
import * as filter from "./filter.js";
import * as selector from "./select_new_posts.js";
import * as addNewPosts from "./add_new_posts.js";



let listOfBlogs = config_reader.reader('blog_spec.json');

async function insertPosts(blog){
  let url = blog.link;
  let feedText = await fetcher.fetcher(url);
  if (feedText !== undefined) {
    try {
       let parsedBlogs = feedParser.parse(feedText);
       blog.posts = filter.select(parsedBlogs, blog.filter.includes_any, blog.filter.excludes_all);
       return blog;  
      }
      catch (e) {
       console.error(url);
       console.error(e);
     }
    }
    return blog;
}


listOfBlogs = await Promise.all(listOfBlogs.map(insertPosts));

listOfBlogs = listOfBlogs.filter(blog => blog.hasOwnProperty("posts"));

let newBlogs = await selector.selectNewPosts(listOfBlogs);

await addNewPosts.addNewPosts(newBlogs);






