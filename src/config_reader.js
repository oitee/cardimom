/**
 * Accepts a config (an array of blogs submitted by contributors) as parameter and returns an array of blogs that contain every single valid property
 * @param {[object]} config
 * @returns {[object]}
 */

export function reader(config) {
  try {
    let setOfLinks = new Set();

    let finalList = [];
    if (Array.isArray(config)) {
      for (let blog of config) {
        let currentBlog = {};
        if (
          blog.hasOwnProperty("link") &&
          blog.hasOwnProperty("filter") &&
          blog.hasOwnProperty("twitter_username")
        ) {
          if (
            typeof blog.link == "string" &&
            blog.link.length != 0 &&
            !setOfLinks.has(blog.link)
          ) {
            currentBlog.link = blog.link;
            setOfLinks.add(blog.link);
          } else {
            console.warn(
              `Skipping blog because link is incorrectly configured: ${JSON.stringify(
                blog
              )}`
            );
          }
          if (typeof blog.filter == "object") {
            let keysFilter = Object.keys(blog.filter);
            if (
              keysFilter.length == 2 &&
              blog.filter.hasOwnProperty("includes_any") &&
              blog.filter.hasOwnProperty("excludes_all") &&
              Array.isArray(blog.filter.includes_any) &&
              Array.isArray(blog.filter.excludes_all)
            ) {
              currentBlog.filter = blog.filter;
            } else {
              console.warn(
                `Skipping blog because filter is incorrectly configured: ${JSON.stringify(
                  blog
                )}`
              );
            }
          }
          if (
            typeof blog.twitter_username == "string" &&
            blog.twitter_username.length != 0
          ) {
            currentBlog.twitter_username = blog.twitter_username;
          }
        } else {
          console.warn(
            `Skipping blog due to invalid configuration: ${JSON.stringify(
              blog
            )}`
          );
        }
        let keysCurrentBlog = Object.keys(currentBlog);
        if (keysCurrentBlog.length == 3) {
          finalList.push(currentBlog);
        }
      }
      return finalList;
    }
    throw "list of blogs is not an array:" + config;
  } catch (err) {
    console.error(err);
  }
}
