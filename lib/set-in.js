/**
 * Safe way to set nested properties.
 *
 * @param object {Object} the object to access = require((may be undefined)
 * @param path {Array} an array containing the path of properties to access
 * @param value {*} the value to set
 * @returns a new object with changed value
 */
function setIn(object = {}, path, value) {
    let result = Object.assign({}, object);
    const length = path.length;

    // base case: if object is empty, create the full new path and set value on the leaf
    if (Object.keys(object).length === 0) {
        return path.reduceRight((res, key, i) => {
            return i === path.length - 1 ? { [key]: value } : { [key]: res };
        }, {});
    }

    // base case: optimize for speed until 3 level nesting (most common)
    if (length === 1) {
        if (object) {
            result[path[0]] = value;
        } else {
            result = { [path[0]]: value };
        }
    } else if (length === 2) {
        if (object && object[path[0]]) {
            result[path[0]][path[1]] = value;
        } else {
            result[path[0]] = { [path[1]]: value };
        }
    } else if (length === 3) {
        if (object && object[path[0]] && object[path[0]][path[1]]) {
            result[path[0]][path[1]][path[2]] = value;
        } else if (object && object[path[0]]) {
            result[path[0]] = { [path[1]]: { [path[2]]: value } };
        }

    // base case: empty path, directly return the value
    } else if (length === 0) {
        return value;

    // recursive step: existing root path
    } else if (object[path[0]]) {
        result[path[0]] = setIn(object[path[0]], path.slice(1), value);

    // recursive step: missing root path
    } else {
        result = Object.assign(result, { [path[0]]: setIn({}, path.slice(1), value) });
    }

    return result;
}

module.exports = setIn;
