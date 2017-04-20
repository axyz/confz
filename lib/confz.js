const fs = require('fs');
const getIn = require('./get-in');
const setIn = require('./set-in');
const deepMerge = require('./deep-merge');

const isPlainObject = obj =>
    obj === Object(obj) && Object.prototype.toString.call(obj) !== '[object Array]';

class Confz {
    constructor() {
        this.store = new Map();
    }

    load(src) {
        if (typeof src === 'string') {
            fs.readFile(src, 'utf8', (err, data) => {
                if (err) {
                    console.log(`CONFZ: cannot read config = require( ${src}`);
                    return;
                }

                try {
                    const cfg = JSON.parse(data);
                    Object.keys(cfg).forEach(key => {
                        this.store.set(key, cfg[key]);
                    });
                } catch (e) {
                    console.log(`CONFZ: cannot parse JSON, err: ${e}`);
                }
            });
        } else if (isPlainObject(src)) {
            Object.keys(src).forEach(key => {
                this.store.set(key, src[key]);
            });
        }
    }

    get(key) {
        if (typeof key !== 'string' || key === '') {
            console.log(`CONFZ: key "${key}" is not a valid string`);
            return {};
        }
        const path = key.split(':');
        if (path.length === 1) {
            return JSON.parse(JSON.stringify(this.store.get(path[0]) || {}));
        }

        const data = getIn(this.store.get(path[0]), path.slice(1, path.length), {});
        // always return a deep clone to avoid any reference to the original values to be exposed
        // it is fine to use JSON.parse as config should be json serializable.
        return JSON.parse(JSON.stringify(data));
    }

    set(key, value) {
        if (typeof key !== 'string' || key === '') {
            console.log(`CONFZ: key "${key}" is not a valid string`);
            return;
        }
        const path = key.split(':');
        if (path.length === 1) {
            this.store.set(path[0], value);
        } else {
            const subTree = this.store.get(path[0]) || {};
            const newSubTree = setIn(subTree, path.slice(1, path.length), value);
            this.store.set(path[0], newSubTree);
        }
    }

    extend(key, value) {
        const original = this.get(key);
        const extended = deepMerge(original, value);

        this.set(key, extended);
    }
}

module.exports = Confz;
