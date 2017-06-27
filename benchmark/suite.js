const Benchmark = require('benchmark');
const Confz = require('../');
const sample = require('./sample-data.json');
let CONFZ;

const suite = new Benchmark.Suite();

function reset() {
    CONFZ = new Confz();
    CONFZ.load({
        foo: { bar: 'baz' },
        a: {b: {c: {d: {e: {f: {g: {h: {i: {j: {k: {l: 1, m: 2, n: [1, 2]}}}}}}}}}}},
        aaa: { bbb: 'ccc' },
        sample: { some: { big: { data: sample } } },
        ddd: { eee: { fff: { ggg: 'test' } } },
    });
}

suite
    .on('start', reset)
    .add('get', () => {
        CONFZ.get('ddd');
    })
    .add('get nested', () => {
        CONFZ.get('ddd:eee:fff:ggg');
    })
    .add('get deeply nested', () => {
        CONFZ.get('a:b:c:d:e:f:g:h:i:j:k:n');
    })
    .add('get huge object', () => {
        CONFZ.get('sample');
    })
    .add('set', () => {
        CONFZ.set('foo', { hello: 'hello' });
    })
    .add('set nested', () => {
        CONFZ.set('aaa:xxx:yyy:zzz', 'hello');
    })
    .add('set deeply nested', () => {
        CONFZ.set('a:b:c:d:e:f:g:h:i:j:k:n', { hello: ['hello', 'hello']});
    })
    .on('cycle', event => {
        console.log(String(event.target));
        reset();
    })
    .on('complete', () => {
        console.log('DONE');
    }).run({ async: true });
