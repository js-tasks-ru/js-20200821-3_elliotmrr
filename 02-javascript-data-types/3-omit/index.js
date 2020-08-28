/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  const newObj = {};
  const isPropContain = (fieldProp, objProp) => fieldProp === objProp;

  for (let prop in obj) {
    if (fields.some(isPropContain.bind(null, prop))) {
      continue;
    }

    newObj[prop] = obj[prop];
  }

  return newObj;
};
