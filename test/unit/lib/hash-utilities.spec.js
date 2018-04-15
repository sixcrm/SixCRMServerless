const chai = require('chai');
const expect = chai.expect;
const hashutilities = global.SixCRM.routes.include('lib', 'hash-utilities.js');

describe('lib/hash-utilities', () => {

	describe('toSHA1', () => {

		it('toSHA1', () => {
			expect(hashutilities.toSHA1('test')).to.equal('a94a8fe5ccb19ba61c4c0873d391e987982fbbd3');
			expect(hashutilities.toSHA1('anyString123')).to.equal('5d8461ffc4a16531acb4ff55dcdf0ef722bb3f26');
			expect(hashutilities.toSHA1('')).to.equal('da39a3ee5e6b4b0d3255bfef95601890afd80709');
			expect(hashutilities.toSHA1([])).to.equal('da39a3ee5e6b4b0d3255bfef95601890afd80709');
			expect(hashutilities.toSHA1(['a', 'b'])).to.equal('1489f923c4dca729178b3e3233458550d8dddf29');
			expect(hashutilities.toSHA1(['a', 'b', 'c', 'd'])).to.equal('9069ca78e7450a285173431b3e52c5c25299e473');
			expect(hashutilities.toSHA1(() => {})).to.equal('da39a3ee5e6b4b0d3255bfef95601890afd80709');
		});

		it('throws error when argument type is unrecognized', () => {
			let unexpected_args = [123, 11.22, -123, null, true];

			unexpected_args.forEach(arg => {
				try{
					hashutilities.toSHA1(arg)
				}catch(error) {
					expect(error.message).to.equal('[500] Unrecognized argument type.');
				}
			});
		});

		it('throws error when argument is not an expected type', () => {
			let unexpected_params = [{}, {a: 'b'}, {a: 'b', c: 'd'}];

			unexpected_params.forEach(param => {
				expect(() => hashutilities.toSHA1(param)).to.throw();
			});
		});
	});

	describe('toBase64', () => {

		it('toBase64', () => {
			expect(hashutilities.toBase64('test')).to.equal('dGVzdA==');
			expect(hashutilities.toBase64('anyString123')).to.equal('YW55U3RyaW5nMTIz');
			expect(hashutilities.toBase64('')).to.equal('');
			expect(hashutilities.toBase64([])).to.equal('');
			expect(hashutilities.toBase64(['a', 'b'])).to.equal('AAA=');
			expect(hashutilities.toBase64(['a', 'b', 'c', 'd'])).to.equal('AAAAAA==');
			expect(hashutilities.toBase64(() => {})).to.equal('');
		});

		it('throws error when argument type is unrecognized', () => {
			let unexpected_args = [123, 11.22, -123, null, true];

			unexpected_args.forEach(arg => {
				try{
					hashutilities.toBase64(arg)
				}catch(error) {
					expect(error.message).to.equal('[500] Unrecognized argument type.');
				}
			});
		});

		it('throws error when argument is not an expected type', () => {
			let unexpected_params = [{}, {a: 'b'}, {a: 'b', c: 'd'}];

			unexpected_params.forEach(param => {
				expect(() => hashutilities.toBase64(param)).to.throw();
			});
		});
	});
});
