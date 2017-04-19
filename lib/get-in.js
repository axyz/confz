/**
 * Safe way to access nested properties.
 *
 * @param object {Object} the object to access = require((may be undefined)
 * @param path {Array} an array containing the path of properties to access
 * @param optionalDefault {Object} an optional default to return when the result is undefined
 * @returns {*}
 */
module.exports = (object = {}, path, optionalDefault) => {
    let result;
    const length = path.length;

    if (length === 1) {
        result = object && object[path[0]];
    } else if (length === 2) {
        result = object && object[path[0]] && object[path[0]][path[1]];
    } else if (length === 3) {
        result = object && object[path[0]] && object[path[0]][path[1]] && object[path[0]][path[1]][path[2]];
    } else if (length === 0) {
        return optionalDefault;
    } else {
        result = path.reduce((o, p) => o && o[p], object);
    }

    return result === undefined ? optionalDefault : result;
};
