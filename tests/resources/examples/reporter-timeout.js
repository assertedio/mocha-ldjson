describe('suite 1', function() {
  this.timeout(20000);
  it('test timeout', (done) => {
    setTimeout(done, 10000);
  });
});
