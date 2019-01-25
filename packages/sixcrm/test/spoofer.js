const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const _ = require('lodash');
const faker = require('faker/locale/en');

module.exports = class Spoofer{

	static createURL(){
		return faker.internet.url();
	}

	static createDomainName(){
		return faker.internet.domainName();
	}

	static createRandomEmail(){
		return faker.internet.email();
	}

	static createRandomPhoneNumber(){
		return faker.phone.phoneNumber();
	}

	static createRandomAddress(segment){

		segment = (_.isUndefined(segment))?'full':segment;

		if(!_.includes(['line1','line2','city','state','zip', 'country', 'full'], segment)){
			throw eu.getError('server', 'Unknown address segment: '+segment);
		}

		let methods = {
			line1: () => faker.address.streetAddress(),
			line2: () => faker.address.secondaryAddress(),
			city: () => faker.address.city(),
			state: () => faker.address.stateAbbr(),
			zip:() => faker.address.zipCode(),
			country: () => faker.address.countryCode()
		};

		return methods[segment]();

	}

	static createRandomName(segment){

		segment = (_.isUndefined(segment))?'full':segment;

		if(!_.includes(['first','middle','last','full'], segment)){
			throw eu.getError('server', 'Unknown name segment: '+segment)
		}

		let methods = {
			full: () => faker.name.findName(),
			first: () => faker.name.firstName(),
			last: () => faker.name.lastName(),
			middle: () => faker.name.firstName()
		};

		return methods[segment]();

	}

}
