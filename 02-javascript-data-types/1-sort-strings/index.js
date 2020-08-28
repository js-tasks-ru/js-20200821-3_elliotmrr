/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  compareStr = compareWithDirection(compareStr, param);

  return [...arr].sort(compareStr);

  function compareWithDirection(f, direction) {
    return function(a, b) {
      return direction === "asc" ? f(a, b) : f(b, a);
    };
  }

  function compareStr(a, b) {
    const langReg = [
      "en-GB",
      "en-US",
      "ru-RU",
      "ru-BY",
    ];
    // Intl.Collator is almost twice as fast than a.localeCompare(b)
    const collator = new Intl.Collator(langReg, {
      sensitivity: "variant",
      caseFirst: "upper",
    });

    return collator.compare(a, b);
  }
}
