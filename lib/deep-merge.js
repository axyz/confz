const isPlainObject = obj =>
    !Array.isArray(obj) && typeof obj === 'object';

const deepMerge = (objA = {}, objB = {}) => {
    if (!isPlainObject(objA) || !isPlainObject(objB)) {
        return objA;
    }

    if (!objA && objB) {
        return objB;
    } else if (objA && !objB) {
        return objA;
    } else if (!objA && !objB) {
        return {};
    }

    const merged = {};
    for (const each in objB) { //eslint-disable-line no-restricted-syntax
        if (Object.prototype.hasOwnProperty.call(objA, each) && Object.prototype.hasOwnProperty.call(objB, each)) {
            if (isPlainObject(objA[each]) && isPlainObject(objB[each])) {
                merged[each] = deepMerge(objA[each], objB[each]);
            } else {
                merged[each] = objB[each];
            }
        } else if (Object.prototype.hasOwnProperty.call(objB, each)) {
            merged[each] = objB[each];
        }
    }
    for (const each in objA) { //eslint-disable-line no-restricted-syntax
        if (!(each in objB) && Object.prototype.hasOwnProperty.call(objA, each)) {
            merged[each] = objA[each];
        }
    }
    return merged;
};

module.exports = deepMerge;
