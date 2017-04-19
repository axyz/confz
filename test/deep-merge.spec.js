const assert = require('assert');
const deepMerge = require('../lib/deep-merge');

describe('Sample', () => {
    it('should deep merge correctly', async () => {
        const original = { a: 'foo', b: { c: 'bar' } };
        const modified = { b: { c: 'foo', d: 'foobar' } };
        const merge = deepMerge(original, modified);
        assert.deepEqual(merge, {
            a: 'foo',
            b: {
                c: 'foo',
                d: 'foobar',
            },
        });
    });
});
