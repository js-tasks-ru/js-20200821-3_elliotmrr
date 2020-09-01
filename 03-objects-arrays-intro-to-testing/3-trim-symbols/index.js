/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  switch (size) {
  case 0:
    return "";

  case undefined:
    return string;

  default:
    return trimmedStr();
  }

  function trimmedStr() {
    const currentCountChar = new Map();
    let count;
    const filter = char => {
      count = currentCountChar.get(char);

      switch (true) {
      case count === undefined:
        currentCountChar.set(char, 1);
        return true;

      case count < size:
        currentCountChar.set(char, ++count);
        return true;

      default:
        return false;
      }
    };

    return string
      .split('')
      .filter(filter)
      .join('');
  }
}
