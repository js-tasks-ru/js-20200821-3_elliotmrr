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
    return trimStr();
  }

  function trimStr() {
    const firstSlice = string.slice(0, size);
    const restSlice = [...string.slice(size)];

    return restSlice.reduce((string, char) => {
      if (!string.endsWith(char.repeat(size))) {
        string += char;
      }

      return string;
    }, firstSlice);
  }
}
