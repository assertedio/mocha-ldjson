describe('suite 1', function () {
  it('test pass', () => null);
  describe('nested describe', () => {
    it('nested test pass', () => null);

    describe('nested deep describe', () => {
      it('nested deep test pass', () => null);

      describe('nested deeper describe', () => {
        it('nested deeper test pass', () => null);

        describe('nested so deep describe', () => {
          it('nested so deep test pass', () => null);
        });
      });
    });
  });
  describe('nested describe 2', () => {
    it('nested d2 test', () => null);
  });
});

describe('suite 2', function () {
  it('suite2 pass', () => null);
});
