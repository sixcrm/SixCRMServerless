import { expect } from 'chai';
import 'mocha';
import {EmailAddress} from "./EmailAddress";

describe('Email', () => {

	it('should instantiate with a valid email addresses', () => {
		const address: string = 'someone@example.com';
		expect(new EmailAddress(address).address).to.equal(address);
	});

	it('should throw an error with an invalid email addresses', () => {
		const address: string = '@@.somestring';
		expect(() => new EmailAddress(address)).to.throw();
	});

	it('instances made from the same address should have the same value', () => {
		const address: string = 'someone@example.com';
		expect(new EmailAddress(address).sameValueAs(new EmailAddress(address))).to.be.true;
	});

	it('instances made from different addresses should not have the same value', () => {
		const address1: string = 'someone@example.com';
		const address2: string = 'noone@example.com';
		expect(new EmailAddress(address1).sameValueAs(new EmailAddress(address2))).to.be.false;
	});

	it('instances should have the same value as itself', () => {
		const emailAddress: EmailAddress = new EmailAddress('someone@example.com');
		expect(emailAddress.sameValueAs(emailAddress)).to.be.true;
	});


});
