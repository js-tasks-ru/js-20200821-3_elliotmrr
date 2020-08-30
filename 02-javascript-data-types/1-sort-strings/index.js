/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let sortedArr;

  switch (param) {
  default:
  case "asc":
    sortedArr = sortingArr(arr, 1);
    break;

  case "desc":
    sortedArr = sortingArr(arr, -1);
    break;
  }

  return sortedArr;

  function sortingArr(arr, direction) {
    return [...arr].sort((a, b) => {
      return direction * a.localeCompare(b, "default", {caseFirst: "upper"});
    });
  }
}
