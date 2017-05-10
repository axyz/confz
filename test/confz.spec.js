const assert = require('assert');
const Confz = require('../lib/confz');

describe('Confz', () => {
    it('should create a new Confz instance', () => {
        const CONFZ = new Confz();
        assert.ok(CONFZ instanceof Confz);
    });

    it('should initialize using plain object', () => {
        const CONFZ = new Confz();
        CONFZ.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        assert.deepEqual(CONFZ.get('foo'), { bar: 'baz' });
        assert.deepEqual(CONFZ.get('aaa'), { bbb: 'ccc' });
        assert.deepEqual(CONFZ.get('ddd:eee:fff'), { ggg: 'test' });
        assert.equal(CONFZ.get('ddd:eee:fff:ggg'), 'test');
    });

    it('should set and get first level keys', () => {
        const CONFZ = new Confz();
        CONFZ.set('foo', 'bar');
        CONFZ.set('baz', 'qux');

        assert.equal(CONFZ.get('foo'), 'bar');
        assert.equal(CONFZ.get('baz'), 'qux');

        CONFZ.set('baz', 'vegas');
        assert.equal(CONFZ.get('foo'), 'bar');
        assert.equal(CONFZ.get('baz'), 'vegas');
    });

    it('should handle non string keys', () => {
        const CONFZ = new Confz();
        CONFZ.set(null, 'foo');
        assert.deepEqual(CONFZ.get(null), undefined);
        CONFZ.set(3, 'foo');
        assert.deepEqual(CONFZ.get(3), undefined);
        CONFZ.set(undefined, 'foo');
        assert.deepEqual(CONFZ.get(undefined), undefined);
        CONFZ.set(false, 'foo');
        assert.deepEqual(CONFZ.get(false), undefined);
        CONFZ.set({}, 'foo');
        assert.deepEqual(CONFZ.get({}), undefined);
    });

    it('should ignore empty paths', () => {
        const CONFZ = new Confz();
        CONFZ.set('', { foo: 'bar' });
        assert.deepEqual(CONFZ.get(''), undefined);
    });

    it('should return undefined for non existent keys', () => {
        const CONFZ = new Confz();

        assert.deepEqual(CONFZ.get('foo'), undefined);
        assert.deepEqual(CONFZ.get('foo:bar'), undefined);

        CONFZ.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        assert.equal(CONFZ.get('a'), undefined);
        assert.equal(CONFZ.get('a:b:c:d:e:f'), undefined);
        assert.equal(CONFZ.get(''), undefined);
    });

    it('should set and get nested keys', () => {
        const CONFZ = new Confz();
        CONFZ.set('foo:bar', 'baz');

        const foo = CONFZ.get('foo');
        assert.deepEqual(foo, { bar: 'baz' });
        assert.equal(CONFZ.get('foo:bar'), 'baz');
    });

    it('should set and get deeply nested keys', () => {
        const CONFZ = new Confz();
        CONFZ.set('foo:bar:baz:qux:quux', 'test');

        const foo = CONFZ.get('foo');
        assert.deepEqual(foo, { bar: { baz: { qux: { quux: 'test' } } } });
        assert.deepEqual(CONFZ.get('foo:bar:baz'), { qux: { quux: 'test' } });
        assert.equal(CONFZ.get('foo:bar:baz:qux:quux'), 'test');
    });

    it('should correctly set on partially existing paths', () => {
        const CONFZ = new Confz();
        CONFZ.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        CONFZ.set('aaa:c:d:e:f', 'vegas');
        assert.deepEqual(CONFZ.get('aaa'), { bbb: 'ccc', c: { d: { e: { f: 'vegas' } } } });

        CONFZ.set('foo:x', 'y');
        assert.deepEqual(CONFZ.get('foo'), { bar: 'baz', x: 'y' });
    });

    it('should reassign first level keys', () => {
        const CONFZ = new Confz();
        CONFZ.set('aaa', 'ccc');
        assert.equal(CONFZ.get('aaa'), 'ccc');

        CONFZ.set('aaa', 'ddd');
        assert.equal(CONFZ.get('aaa'), 'ddd');
    });

    it('should reassign nested keys', () => {
        const CONFZ = new Confz();
        CONFZ.set('aaa:bbb:ccc', 'ddd');
        assert.equal(CONFZ.get('aaa:bbb:ccc'), 'ddd');

        CONFZ.set('aaa:bbb:ccc', 'eee');
        assert.equal(CONFZ.get('aaa:bbb:ccc'), 'eee');
    });

    it('should set nested keys preserving existing config', () => {
        const CONFZ = new Confz();
        CONFZ.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        CONFZ.set('ddd:eee:fff', 'vegas');
        assert.deepEqual(CONFZ.get('ddd:eee'), { fff: 'vegas' });
        assert.equal(CONFZ.get('ddd:eee:fff'), 'vegas');
        assert.equal(CONFZ.get('foo:bar'), 'baz');
        assert.deepEqual(CONFZ.get('aaa'), { bbb: 'ccc' });
    });

    it('should not expose internal store references for first level', () => {
        const CONFZ = new Confz();
        CONFZ.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        const config = CONFZ.get('ddd');
        config.eee.fff = 'vegas';

        assert.equal(config.eee.fff, 'vegas');
        assert.deepEqual(CONFZ.get('ddd:eee:fff'), { ggg: 'test' });
    });

    it('should not expose internal store references for nested objects', () => {
        const CONFZ = new Confz();
        CONFZ.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        const config = CONFZ.get('ddd:eee');
        config.fff = 'vegas';

        assert.equal(config.fff, 'vegas');
        assert.deepEqual(CONFZ.get('ddd:eee:fff'), { ggg: 'test' });
    });

    it('should extend existing config', () => {
        const CONFZ = new Confz();
        CONFZ.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
            ccc: { xxx: [] },
        });

        CONFZ.extend('foo', { qux: true });
        assert.deepEqual(CONFZ.get('foo'), { qux: true, bar: 'baz' });

        CONFZ.extend('aaa', { bbb: 'hollywood' });
        assert.deepEqual(CONFZ.get('aaa'), { bbb: 'hollywood' });

        CONFZ.extend('ddd:eee', { quux: false, fff: { baaz: 'vegas' } });
        assert.deepEqual(CONFZ.get('ddd'), { eee: { quux: false, fff: { baaz: 'vegas', ggg: 'test' } } });

        CONFZ.extend('ccc', { xxx: ['ciao'] });
        assert.deepEqual(CONFZ.get('ccc'), { xxx: ['ciao'] });
    });

    it('should not extend existing arrays', () => {
        const CONFZ = new Confz();
        CONFZ.load({
            foo: { bar: 'baz' },
            aaa: { bbb: [1, 2, 3] },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        CONFZ.extend('aaa', { bbb: [4, 5, 6] });
        assert.deepEqual(CONFZ.get('aaa'), { bbb: [4, 5, 6] });
    });

    it('should not extend existing strings', () => {
        const CONFZ = new Confz();
        CONFZ.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        CONFZ.extend('aaa', { bbb: 'zzz' });
        assert.deepEqual(CONFZ.get('aaa'), { bbb: 'zzz' });
    });

    it('should not extend with non objects arguments', () => {
        const CONFZ = new Confz();
        CONFZ.load({
            foo: { bar: [1, 2, 3] },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        CONFZ.extend('aaa', 'zzz');
        assert.deepEqual(CONFZ.get('aaa'), { bbb: 'ccc' });

        CONFZ.extend('foo:bar', [4, 5, 6]);
        assert.deepEqual(CONFZ.get('foo'), { bar: [1, 2, 3] });
    });
});
