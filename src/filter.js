/**
 * [description: selects a list of posts etc]
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
  let lowerCaseContent = post.content.toLowerCase();
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
