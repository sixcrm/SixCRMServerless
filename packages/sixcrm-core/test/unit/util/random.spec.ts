import Random from '../../../src/util/random';
import * as chai from 'chai';
const expect = chai.expect;

function expectUppercase(s: string) {
	expect(s).to.be.a('string');
	expect(s.toUpperCase()).to.equal(s, 'expected ' + s + ' to be all uppercase');
}

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
			expectUppercase(Random.createRandomString());
		}
	});

	it('should create only alphanumeric strings', () => {
		for (let i = 0; i < 100; i++) {
			expect(Random.createRandomString()).to.match(/^[A-Za-z0-9]*$/);
		}
	});

	describe('selectRandomFromArray', () => {

		it('returns error when argument is not an array', () => {
			try {
				Random.selectRandomFromArray('test');
			} catch (error) {
				expect(error.message).to.equal('[500] List argument must be an array.');
			}
		});

		it('returns error when array is empty', () => {
			try {
				Random.selectRandomFromArray([]);
			} catch (error) {
				expect(error.message).to.equal('[500] List argument must be of length one or greater.');
			}
		});

		it('checks if a selected random index from array is a number', () => {
			expect(Random.selectRandomFromArray([1, 2])).to.be.a('number');
		});
	});

	describe('randomInt', () => {

		it('returns error when first input (minimum) is not an integer', () => {
			try {
				Random.randomInt('1', 2);
			} catch (error) {
				expect(error.message).to.equal('[500] Minimum input is not an integer.');
			}
		});

		it('returns error when second input (maximum) is not an integer', () => {
			try {
				Random.randomInt(1, '2');
			} catch (error) {
				expect(error.message).to.equal('[500] Maximum input is not an integer.');
			}
		});

		it('selects random number between min and max input', () => {
			expect(Random.randomInt(1, 2)).to.be.a('number');
		});
	});

	describe('randomDouble', () => {

		it('returns error when first input (minimum) is not an integer', () => {
			try {
				Random.randomDouble('1', 2);
			} catch (error) {
				expect(error.message).to.equal('[500] Minimum input is not an integer.');
			}
		});

		it('returns error when second input (maximum) is not an integer', () => {
			try {
				Random.randomDouble(1, '2');
			} catch (error) {
				expect(error.message).to.equal('[500] Maximum input is not an integer.');
			}
		});

		it('returns error when precision input is not an integer', () => {
			try {
				Random.randomDouble(1, 2, '3' as any);
			} catch (error) {
				expect(error.message).to.equal('[500] Precision input is not an integer.');
			}
		});

		it('generates random double with specified precision', () => {
			expect(Random.randomDouble(1, 2, 1)).to.be.a('number');
		});
	});

	describe('randomProbability', () => {

		it('returns error when probability is not between 0 and 1', () => {
			try {
				Random.randomProbability(2);
			} catch (error) {
				expect(error.message).to.equal('[500] Probability must be greater than or equal to 0 and less than or equal to 1');
			}
		});

		it('returns error when probability is not a number', () => {
			try {
				Random.randomProbability('potato');
			} catch (error) {
				expect(error.message).to.equal('[500] Probability is not a number.');
			}
		});

		it('returns random probability', () => {
			expect(Random.randomProbability(1)).to.be.true;
		});
	});

	describe('randomGaussian', () => {

		it('generates random gaussian', () => {
			expect(Random.randomGaussian(1, 2)).to.be.a('number');
		});
	});

});
