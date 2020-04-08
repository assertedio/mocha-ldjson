// eslint-disable-next-line @typescript-eslint/no-var-requires
const assert = require('assert');
const { expect } = require('chai');

describe('suite 1', function() {
  it('test pass', () => null);
  it('test fail', () => {
    expect({ foo: 'bar' }).to.eql({ foo: 'baz' });
  });
  it('skipped test', () => null);
  describe('nested describe', () => {
    it('nested test pass', () => null);
    it('nested test fail', () => assert.ok(null));
  });
  describe('nested describe 2', () => {
    it('nested d2 test', () => null);
  });
});

describe('suite 2', function() {
  it('suite2 pass', () => null);
});
