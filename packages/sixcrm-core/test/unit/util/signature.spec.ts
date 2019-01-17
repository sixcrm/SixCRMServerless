import Signature from '../../../src/util/signature';
import * as chai from 'chai';
const expect = chai.expect;

describe('lib/signature', () => {
	describe('createSignature', () => {

		it('should create a signature', () => {
			// given
			const aSecret = 'secret';
			const aRequestTime = 1487780578479;
			const expectedSignature = 'a503c6aa8055a9d1c5ea39d39b22e20459afe30c';

			// when
			const aSignature = Signature.createSignature(aSecret, aRequestTime);

			// then
			expect(aSignature).to.equal(expectedSignature);
		});

		it('should create a same signature for same secret and request time', () => {
			// given
			const aSecret = 'secret';
			const aRequestTime = 1487780578479;

			// when
			const firstSignature = Signature.createSignature(aSecret, aRequestTime);
			const secondSignature = Signature.createSignature(aSecret, aRequestTime);

			// then
			expect(firstSignature).to.equal(secondSignature);
		});

		it('should create a different signature for same secret and different request time', () => {
			// given
			const aSecret = 'secret';
			const aRequestTime = 1487780578479;
			const anotherRequestTime = 1487781041304;

			// when
			const firstSignature = Signature.createSignature(aSecret, aRequestTime);
			const secondSignature = Signature.createSignature(aSecret, anotherRequestTime);

			// then
			expect(firstSignature).not.to.equal(secondSignature);
		});

		it('should create a different signature for different secret and same request time', () => {
			// given
			const aSecret = 'secret';
			const anotherSecret = 'another secret';
			const aRequestTime = 1487780578479;

			// when
			const firstSignature = Signature.createSignature(aSecret, aRequestTime);
			const secondSignature = Signature.createSignature(anotherSecret, aRequestTime);

			// then
			expect(firstSignature).not.to.equal(secondSignature);
		});

		it('should create a different signature for different secret and different request time', () => {
			// given
			const aSecret = 'secret';
			const anotherSecret = 'another secret';
			const aRequestTime = 1487780578479;
			const anotherRequestTime = 1487781041304;

			// when
			const firstSignature = Signature.createSignature(aSecret, aRequestTime);
			const secondSignature = Signature.createSignature(anotherSecret, anotherRequestTime);

			// then
			expect(firstSignature).not.to.equal(secondSignature);
		});

	});

	describe('validateSignature', () => {

		it('should validate a signature', () => {
			// given
			const aSecret = 'secret';
			const aRequestTime = 1487780578479;

			// signature that is created with secret and requested time
			const aCreatedSignature = 'a503c6aa8055a9d1c5ea39d39b22e20459afe30c';

			expect(Signature.validateSignature(aSecret, aRequestTime, aCreatedSignature)).to.be.true;
		});
	});
});
