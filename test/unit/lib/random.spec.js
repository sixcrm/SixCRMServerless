let Random = require('../../../lib/random');
let chai = require('chai');
let expect = chai.expect;

chai.Assertion.addProperty('uppercase', function () {
    let obj = this._obj;
    new chai.Assertion(obj).to.be.a('string');

    this.assert(
        obj === obj.toUpperCase(),
        'expected #{this} to be all uppercase',
        'expected #{this} to not be all uppercase'
    );
});

describe('lib/random', () => {

    it('should create random string of given length', () => {
        expect(Random.createRandomString(5)).to.have.lengthOf(5);
        expect(Random.createRandomString(1000)).to.have.lengthOf(1000);
    });

    it('should default to length of 32', () => {
        expect(Random.createRandomString(0)).to.have.lengthOf(32);
        expect(Random.createRandomString()).to.have.lengthOf(32);
    });

    it('should create different strings on consecutive executions', () => {
        for (let i = 0; i < 100; i++) {
            expect(Random.createRandomString()).not.to.be.equal(Random.createRandomString());
        }
    });

    it('should create strings without lowercase letters', () => {
        for (let i = 0; i < 100; i++) {
            expect(Random.createRandomString()).to.be.uppercase;
        }
    });

    it('should create only alphanumeric strings', () => {
        for (let i = 0; i < 100; i++) {
            expect(Random.createRandomString()).not.to.include
                .members['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '.', '-', '/'];
        }
    });

});
