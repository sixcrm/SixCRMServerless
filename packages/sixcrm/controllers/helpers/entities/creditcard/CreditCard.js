const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;

module.exports = class CreditCardHelper {

	constructor(){

	}

	formatRawCreditCard(creditcard){
		return creditcard;

	}

	getFirstName(creditcard){
		if(_.has(creditcard, 'name') && stringutilities.nonEmpty(creditcard.name)){

			let ccnamesplit = _.trim(creditcard.name).replace(/\s+/g,' ').split(' ');
			ccnamesplit.pop();
			return arrayutilities.compress(ccnamesplit, ' ', '');

		}

		return null;

	}

	getLastName(creditcard){
		if(_.has(creditcard, 'name') && stringutilities.nonEmpty(creditcard.name)){

			let ccnamesplit = _.trim(creditcard.name).replace(/\s+/g,' ').split(' ');
			return ccnamesplit.pop();

		}

		return null;

	}

	getExpirationMonth(creditcard){
		if(!_.has(creditcard, 'expiration')){
			throw eu.getError('server', 'CreditCardHelper.getExpirationMonth assumes creditcard object contains the expiration property.');
		}

		let expiration_first_two;

		let expiration = creditcard.expiration;

		if(expiration.indexOf('/') !== -1){
			expiration = creditcard.expiration.split('/')[0];
		}

		if(expiration.length == 3 || expiration.length == 5){
			expiration_first_two = '0'+expiration.substr(0, 1);
		}else{
			expiration_first_two = expiration.substr(0, 2);
		}

		if(expiration_first_two.length < 2){
			expiration_first_two = '0'+expiration_first_two;
		}

		return expiration_first_two;

	}

	getExpirationYear(creditcard){
		if(!_.has(creditcard, 'expiration')){
			throw eu.getError('server', 'CreditCardHelper.getExpirationYear assumes creditcard object contains the expiration property.');
		}

		let expiration_last_two = creditcard.expiration.substr(creditcard.expiration.length - 2);

		return '20'+expiration_last_two;

	}

	getBINNumber(creditcard){
		let cc_number = null;

		if(_.has(creditcard, 'first_six')){

			cc_number = creditcard.first_six;

		}else if(_.isString(creditcard)){

			cc_number = creditcard;

		}

		if(!_.isNull(cc_number)){

			cc_number = cc_number.slice(0,6);

		}

		return cc_number;

	}

	getAddress(creditcard){
		return Promise.resolve(creditcard.address);

	}

	sameCard(creditcard, test_card, fatal){
		fatal = (_.isUndefined(fatal))?false:fatal;

		let bad_field = arrayutilities.find(objectutilities.getKeys(creditcard), creditcard_field => {

			if(!_.has(test_card, creditcard_field)){
				return true;
			}

			let test_field = test_card[creditcard_field];
			let fact_field = creditcard[creditcard_field];

			if(typeof test_field !== typeof fact_field){
				return true;
			}

			if((_.isString(fact_field) || _.isNumber(fact_field)) && fact_field !== test_field){
				return true;
			}

			if(_.isObject(fact_field)){
				if(!_.isMatch(fact_field, test_field)){
					return true;
				}
			}

			return false;

		});

		if(!_.isUndefined(bad_field)){

			let message = 'Cards do not match.  Bad field: '+bad_field;

			if(fatal == true){
				throw eu.getError('server', message);
			}

			return false;

		}

		return true;

	}

	lastFour(creditcard_number){
		let last = creditcard_number.slice(-4);
		let first = creditcard_number.replace(/[^0-9]/g,'').slice(0, -4).replace(/[0-9]/g, '*');

		return first+last;

	}

	async getTag(entity, name){
		const TagController = global.SixCRM.routes.include('entities', 'Tag.js');
		let tagController = new TagController();

		let tag = await tagController.listByEntityAndKey({id: entity, key: name});

		if(!_.isNull(tag)){
			return tag.value;
		}

		return null;

	}

};
