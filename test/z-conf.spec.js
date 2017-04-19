const assert = require('assert');
const Zconf = require('../lib/z-conf');

describe('Zconf', () => {
    it('should create a new Zconf instance', () => {
        const ZCONF = new Zconf();
        assert.ok(ZCONF instanceof Zconf);
    });

    it('should initialize using plain object', () => {
        const ZCONF = new Zconf();
        ZCONF.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        assert.deepEqual(ZCONF.get('foo'), { bar: 'baz' });
        assert.deepEqual(ZCONF.get('aaa'), { bbb: 'ccc' });
        assert.deepEqual(ZCONF.get('ddd:eee:fff'), { ggg: 'test' });
        assert.equal(ZCONF.get('ddd:eee:fff:ggg'), 'test');
    });

    it('should set and get first level keys', () => {
        const ZCONF = new Zconf();
        ZCONF.set('foo', 'bar');
        ZCONF.set('baz', 'qux');

        assert.equal(ZCONF.get('foo'), 'bar');
        assert.equal(ZCONF.get('baz'), 'qux');

        ZCONF.set('baz', 'vegas');
        assert.equal(ZCONF.get('foo'), 'bar');
        assert.equal(ZCONF.get('baz'), 'vegas');
    });

    it('should handle non string keys', () => {
        const ZCONF = new Zconf();
        ZCONF.set(null, 'foo');
        assert.deepEqual(ZCONF.get(null), {});
        ZCONF.set(3, 'foo');
        assert.deepEqual(ZCONF.get(3), {});
        ZCONF.set(undefined, 'foo');
        assert.deepEqual(ZCONF.get(undefined), {});
        ZCONF.set(false, 'foo');
        assert.deepEqual(ZCONF.get(false), {});
        ZCONF.set({}, 'foo');
        assert.deepEqual(ZCONF.get({}), {});
    });

    it('should ignore empty paths', () => {
        const ZCONF = new Zconf();
        ZCONF.set('', { foo: 'bar' });
        assert.deepEqual(ZCONF.get(''), {});
    });

    it('should return {} for non existent keys', () => {
        const ZCONF = new Zconf();

        assert.deepEqual(ZCONF.get('foo'), {});
        assert.deepEqual(ZCONF.get('foo:bar'), {});

        ZCONF.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        assert.deepEqual(ZCONF.get('a'), {});
        assert.deepEqual(ZCONF.get('a:b:c:d:e:f'), {});
        assert.deepEqual(ZCONF.get(''), {});
    });

    it('should set and get nested keys', () => {
        const ZCONF = new Zconf();
        ZCONF.set('foo:bar', 'baz');

        const foo = ZCONF.get('foo');
        assert.deepEqual(foo, { bar: 'baz' });
        assert.equal(ZCONF.get('foo:bar'), 'baz');
    });

    it('should set and get deeply nested keys', () => {
        const ZCONF = new Zconf();
        ZCONF.set('foo:bar:baz:qux:quux', 'test');

        const foo = ZCONF.get('foo');
        assert.deepEqual(foo, { bar: { baz: { qux: { quux: 'test' } } } });
        assert.deepEqual(ZCONF.get('foo:bar:baz'), { qux: { quux: 'test' } });
        assert.equal(ZCONF.get('foo:bar:baz:qux:quux'), 'test');
    });

    it('should correctly set on partially existing paths', () => {
        const ZCONF = new Zconf();
        ZCONF.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        ZCONF.set('aaa:c:d:e:f', 'vegas');
        assert.deepEqual(ZCONF.get('aaa'), { bbb: 'ccc', c: { d: { e: { f: 'vegas' } } } });

        ZCONF.set('foo:x', 'y');
        assert.deepEqual(ZCONF.get('foo'), { bar: 'baz', x: 'y' });
    });

    it('should reassign first level keys', () => {
        const ZCONF = new Zconf();
        ZCONF.set('aaa', 'ccc');
        assert.equal(ZCONF.get('aaa'), 'ccc');

        ZCONF.set('aaa', 'ddd');
        assert.equal(ZCONF.get('aaa'), 'ddd');
    });

    it('should reassign nested keys', () => {
        const ZCONF = new Zconf();
        ZCONF.set('aaa:bbb:ccc', 'ddd');
        assert.equal(ZCONF.get('aaa:bbb:ccc'), 'ddd');

        ZCONF.set('aaa:bbb:ccc', 'eee');
        assert.equal(ZCONF.get('aaa:bbb:ccc'), 'eee');
    });

    it('should set nested keys preserving existing config', () => {
        const ZCONF = new Zconf();
        ZCONF.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        ZCONF.set('ddd:eee:fff', 'vegas');
        assert.deepEqual(ZCONF.get('ddd:eee'), { fff: 'vegas' });
        assert.equal(ZCONF.get('ddd:eee:fff'), 'vegas');
        assert.equal(ZCONF.get('foo:bar'), 'baz');
        assert.deepEqual(ZCONF.get('aaa'), { bbb: 'ccc' });
    });

    it('should not expose internal store references for first level', () => {
        const ZCONF = new Zconf();
        ZCONF.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        const config = ZCONF.get('ddd');
        config.eee.fff = 'vegas';

        assert.equal(config.eee.fff, 'vegas');
        assert.deepEqual(ZCONF.get('ddd:eee:fff'), { ggg: 'test' });
    });

    it('should not expose internal store references for nested objects', () => {
        const ZCONF = new Zconf();
        ZCONF.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        const config = ZCONF.get('ddd:eee');
        config.fff = 'vegas';

        assert.equal(config.fff, 'vegas');
        assert.deepEqual(ZCONF.get('ddd:eee:fff'), { ggg: 'test' });
    });

    it('should extend existing config', () => {
        const ZCONF = new Zconf();
        ZCONF.load({
            foo: { bar: 'baz' },
            aaa: { bbb: 'ccc' },
            ddd: { eee: { fff: { ggg: 'test' } } },
        });

        ZCONF.extend('foo', { qux: true });
        assert.deepEqual(ZCONF.get('foo'), { qux: true, bar: 'baz' });

        ZCONF.extend('aaa', { bbb: 'hollywood' });
        assert.deepEqual(ZCONF.get('aaa'), { bbb: 'hollywood' });

        ZCONF.extend('ddd:eee', { quux: false, fff: { baaz: 'vegas' } });
        assert.deepEqual(ZCONF.get('ddd'), { eee: { quux: false, fff: { baaz: 'vegas', ggg: 'test' } } });
    });
});
