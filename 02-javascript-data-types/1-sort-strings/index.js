/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  return [...arr].sort(compareStrWrapperDirection.bind(null, param));

  /**
   * compareStrWrapperDirection - sorts array of string with direction
   * @param {string} direction - the sorting type "asc" or "desc" or others
   * @param {number} a - first char to compare
   * @param {number} b - second char to compare
   * @returns {number}
   */
  function compareStrWrapperDirection(direction, a, b) {
    switch (direction) {
    case "desc":
      return compareStr(b, a);

    default:
    case "asc":
      return compareStr(a, b);
    }
  }

  function compareStr(a, b) {
    const langReg = [
      "en-GB",
      "en-US",
      "ru-RU",
      "ru-BY",
    ];

    return a.localeCompare(b, langReg, {caseFirst: "upper"});
  }
}
