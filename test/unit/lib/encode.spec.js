const chai = require('chai');
const expect = chai.expect;

const any_string = 'a_random_string';
const base64_string = 'YV9yYW5kb21fc3RyaW5n'; //from any_string
const random_object = {random_key: 'a_random_string'};
const base64_object = 'eyJyYW5kb21fa2V5IjoiYV9yYW5kb21fc3RyaW5nIn0='; //from random_object

describe('lib/encode', () => {

	it('converts from string to base64', () => {
		const encode = global.SixCRM.routes.include('lib', 'encode.js');

		expect(encode.toBase64(any_string)).to.equal(base64_string);
	});

	it('converts from base64 to string', () => {
		const encode = global.SixCRM.routes.include('lib', 'encode.js');

		expect(encode.fromBase64(base64_string)).to.equal(any_string);
	});

	it('converts object to base64', () => {
		const encode = global.SixCRM.routes.include('lib', 'encode.js');

		expect(encode.objectToBase64(random_object)).to.equal(base64_object);
	});

	it('converts base64 to object', () => {
		const encode = global.SixCRM.routes.include('lib', 'encode.js');

		expect(encode.base64ToObject(base64_object)).to.deep.equal(random_object);
	});
});