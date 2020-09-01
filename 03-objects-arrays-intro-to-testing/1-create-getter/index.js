/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return (obj) => {

    let value = obj;
    for (const prop of path.split(".")) {
      if (!(prop in value)) {
        value = undefined;
        break;
      }
      value = value[prop];
    }

    return value;
  };
}
