/**
 * Accepts an array of posts(objects), an arrays of strings that should be present and/or absent in each post (as per filter logic)
 * Returns an array of posts which satisfy the inclusion and exclusion logic
 * @param {[object]} listOfPosts
 * @param {[string]} includes
 * @param {[string]} excludes
 * @returns {[object]}
 */
export function select(listOfPosts, includes, excludes) {
  let includesLowerCase = includes.map((word) => word.toLowerCase());
  let excludesLowerCase = excludes.map((word) => word.toLowerCase());
  return listOfPosts.filter((post) =>
    satisfies(post, includesLowerCase, excludesLowerCase)
  );
}

function satisfies(post, includes, excludes) {
  let title = post.title.toLowerCase();
  let content = post.content.toLowerCase();
  let lowerCaseContent = title + content;

  return (
    (includes.length == 0 || includesAny(lowerCaseContent, includes)) &&
    (excludes.length == 0 || !includesAny(lowerCaseContent, excludes))
  ); //de morgans law (!A & !B) = !(A or B)
}

function includesAny(post, words) {
  return words.some((word) => includesOne(post, word));
}

function includesOne(post, word) {
  return post.indexOf(word) >= 0;
}
