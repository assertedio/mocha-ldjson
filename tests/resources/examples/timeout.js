describe('suite 1', function() {
  this.timeout(50);
  it('test timeout', (done) => {
    setTimeout(done, 100);
  });
});
