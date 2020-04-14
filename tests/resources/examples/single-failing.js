const { expect } = require('chai');

describe('failing suite', function () {
  it('failing test', () => {
    expect(true).to.eql(false);
  });
});
