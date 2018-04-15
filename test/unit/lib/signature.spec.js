let Signature = global.SixCRM.routes.include('lib', 'signature.js')
let chai = require('chai');
let expect = chai.expect;

describe('lib/signature', () => {
	describe('createSignature', () => {

		it('should create a signature', () => {
			// given
			let aSecret = 'secret';
			let aRequestTime = 1487780578479;
			let expectedSignature = 'a503c6aa8055a9d1c5ea39d39b22e20459afe30c';

			// when
			let aSignature = Signature.createSignature(aSecret, aRequestTime);

			//then
			expect(aSignature).to.equal(expectedSignature);
		});

		it('should create a same signature for same secret and request time', () => {
			// given
			let aSecret = 'secret';
			let aRequestTime = 1487780578479;

			// when
			let firstSignature = Signature.createSignature(aSecret, aRequestTime);
			let secondSignature = Signature.createSignature(aSecret, aRequestTime);

			//then
			expect(firstSignature).to.equal(secondSignature);
		});

		it('should create a different signature for same secret and different request time', () => {
			// given
			let aSecret = 'secret';
			let aRequestTime = 1487780578479;
			let anotherRequestTime = 1487781041304;

			// when
			let firstSignature = Signature.createSignature(aSecret, aRequestTime);
			let secondSignature = Signature.createSignature(aSecret, anotherRequestTime);

			//then
			expect(firstSignature).not.to.equal(secondSignature);
		});

		it('should create a different signature for different secret and same request time', () => {
			// given
			let aSecret = 'secret';
			let anotherSecret = 'another secret';
			let aRequestTime = 1487780578479;

			// when
			let firstSignature = Signature.createSignature(aSecret, aRequestTime);
			let secondSignature = Signature.createSignature(anotherSecret, aRequestTime);

			//then
			expect(firstSignature).not.to.equal(secondSignature);
		});

		it('should create a different signature for different secret and different request time', () => {
			// given
			let aSecret = 'secret';
			let anotherSecret = 'another secret';
			let aRequestTime = 1487780578479;
			let anotherRequestTime = 1487781041304;

			// when
			let firstSignature = Signature.createSignature(aSecret, aRequestTime);
			let secondSignature = Signature.createSignature(anotherSecret, anotherRequestTime);

			//then
			expect(firstSignature).not.to.equal(secondSignature);
		});

	});

	describe('validateSignature', () => {

		it('should validate a signature', () => {
			// given
			let aSecret = 'secret';
			let aRequestTime = 1487780578479;

			//signature that is created with secret and requested time
			let aCreatedSignature = 'a503c6aa8055a9d1c5ea39d39b22e20459afe30c';

			expect(Signature.validateSignature(aSecret, aRequestTime, aCreatedSignature)).to.be.true;
		});
	});
});
