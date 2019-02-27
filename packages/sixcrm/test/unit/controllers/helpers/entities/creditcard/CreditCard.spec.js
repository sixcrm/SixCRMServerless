

let chai = require('chai');
const expect = chai.expect;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidCreditCard() {
	return MockEntities.getValidCreditCard()
}

//const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');

describe('controllers/helpers/entities/creditcard/CreditCard.js', () => {
	describe('constructor', () => {
		it('successfully constructs', () => {
			let creditCardHelperController = new CreditCardHelperController();

			expect(objectutilities.getClassName(creditCardHelperController)).to.equal('CreditCardHelper');
		});
	});

	describe('getExpirationYear', () => {
		it('successfully acquires expiration year in variety of formats', () => {

			let expirations = ['0420','0420','04/20','04/2020','4/2020', '420', '0420', '042020','42020'];

			let creditCardHelperController = new CreditCardHelperController();

			arrayutilities.map(expirations, expiration => {
				expect(creditCardHelperController.getExpirationYear({expiration: expiration})).to.equal('2020');
			})

		});

		it('throws error when credit card has no expiration property', () => {

			let credit_card = getValidCreditCard();

			delete credit_card.expiration;

			let creditCardHelperController = new CreditCardHelperController();

			try {
				creditCardHelperController.getExpirationYear(credit_card)
			} catch (error) {
				expect(error.message).to.equal('[500] CreditCardHelper.getExpirationYear assumes creditcard object contains the expiration property.');
			}
		});
	});

	describe('getExpirationMonth', () => {
		it('successfully acquires expiration month in variety of formats', () => {

			let expirations = ['0420','0420','04/20','04/2020','4/2020', '420', '0420', '042020','42020'];

			let creditCardHelperController = new CreditCardHelperController();

			arrayutilities.map(expirations, expiration => {
				expect(creditCardHelperController.getExpirationMonth({expiration: expiration})).to.equal('04');
			})

		});

		it('throws error when credit card has no expiration property', () => {

			let credit_card = getValidCreditCard();

			delete credit_card.expiration;

			let creditCardHelperController = new CreditCardHelperController();

			try {
				creditCardHelperController.getExpirationMonth(credit_card)
			} catch (error) {
				expect(error.message).to.equal('[500] CreditCardHelper.getExpirationMonth assumes creditcard object contains the expiration property.');
			}
		});
	});

	describe('lastFour', () => {
		it('returns a string of asterisks followed by the last four digits of the number', () => {
			const number = '4111111111119876';
			const expected = '************9876';
			const creditCardHelperController = new CreditCardHelperController();
			const actual = creditCardHelperController.lastFour(number);

			expect(actual).to.equal(expected);
		});

		it('removes whitespace', () => {
			const number = '4111 1111 1111 9876';
			const expected = '************9876';
			const creditCardHelperController = new CreditCardHelperController();
			const actual = creditCardHelperController.lastFour(number);

			expect(actual).to.equal(expected);
		});

		it('matches length of input', () => {
			const number = '4111 1111 11 9876';
			const expected = '**********9876';
			const creditCardHelperController = new CreditCardHelperController();
			const actual = creditCardHelperController.lastFour(number);

			expect(actual).to.equal(expected);
		});
	});

	describe('sameCard', () => {

		it('returns true when credit cards are the same', () => {

			let creditCard = MockEntities.getValidCreditCard();

			let testCreditCard = creditCard;

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			expect(creditCardHelperController.sameCard(creditCard, testCreditCard)).to.be.true;

		});

		it('returns false when test card is missing expected field', () => {

			let creditCard = MockEntities.getValidCreditCard();

			let testCreditCard = MockEntities.getValidCreditCard();

			delete testCreditCard.expiration;

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			expect(creditCardHelperController.sameCard(creditCard, testCreditCard)).to.be.false;
		});

		it('returns false when test card has a mismatching field type', () => {

			let creditCard = MockEntities.getValidCreditCard();

			let testCreditCard = MockEntities.getValidCreditCard();

			testCreditCard.expiration = 1025; //unexpected type

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			expect(creditCardHelperController.sameCard(creditCard, testCreditCard)).to.be.false;
		});

		it('returns false when a field from a test card has a different value', () => {

			let creditCard = MockEntities.getValidCreditCard();

			let testCreditCard = MockEntities.getValidCreditCard();

			testCreditCard.expiration = '1234';

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			expect(creditCardHelperController.sameCard(creditCard, testCreditCard)).to.be.false;
		});

		it('returns false when an object from a test card is not a match', () => {

			let creditCard = MockEntities.getValidCreditCard();

			let testCreditCard = MockEntities.getValidCreditCard();

			testCreditCard.address = {
				"city": "Paris"
			};

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			expect(creditCardHelperController.sameCard(creditCard, testCreditCard)).to.be.false;
		});

		it('throws error when cards do not match', () => {

			let creditCard = MockEntities.getValidCreditCard();

			let testCreditCard = MockEntities.getValidCreditCard();

			testCreditCard.expiration = '1234';

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			try{
				creditCardHelperController.sameCard(creditCard, testCreditCard, true);
			}catch (error){
				expect(error.message).to.equal('[500] Cards do not match.  Bad field: id')
			}
		});
	});

	describe('getAddress', () => {

		it('successfully retrieves address from credit card', () => {

			let creditCard = MockEntities.getValidCreditCard();

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			return creditCardHelperController.getAddress(creditCard).then((result) => {
				expect(result).to.equal(creditCard.address);
			});

		});

	});

	describe('getBINNumber', () => {

		it('retrieves BIN number from credit card', () => {

			let creditCard = getValidCreditCard();

			creditCard.first_six = '411111';

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			expect(creditCardHelperController.getBINNumber(creditCard)).to.equal('411111');
		});

		it('returns credit card number', () => {

			let creditCard = getValidCreditCard();

			creditCard.first_six = '411111';

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			expect(creditCardHelperController.getBINNumber(creditCard.first_six)).to.equal('411111');
		});

		it('returns null when credit card number is a number', () => {

			let creditCard_number = 111111; //any number

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			expect(creditCardHelperController.getBINNumber(creditCard_number)).to.equal(null);
		});

		it('returns null when credit card number is an array', () => {

			let creditCard_number = [];

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			expect(creditCardHelperController.getBINNumber(creditCard_number)).to.equal(null);
		});

		it('returns null when credit card number is an object', () => {

			let creditCard_number = {};

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			expect(creditCardHelperController.getBINNumber(creditCard_number)).to.equal(null);
		});

		it('returns null when credit card number is negative number', () => {

			let creditCard_number = -1111; //any negative number

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			expect(creditCardHelperController.getBINNumber(creditCard_number)).to.equal(null);
		});

		it('returns null when credit card number is decimal number', () => {

			let creditCard_number = 11.123; //any decimal number

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			expect(creditCardHelperController.getBINNumber(creditCard_number)).to.equal(null);
		});
	});

	describe('getFirstName', () => {

		it('retrieves the firstname of a creditcard', () => {

			let creditcard = MockEntities.getValidCreditCard();

			let names = [
				' John Jacob Jingle-Heimer-Schmidtt',
				' John Jacob Jingle-Heimer-Schmidtt ',
				'    John       Jacob Jingle-Heimer-Schmidtt    '
			];

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			arrayutilities.map(names, name => {
				creditcard.name = name;
				expect(creditCardHelperController.getFirstName(creditcard)).to.equal('John Jacob');
			});

		});

		it('returns null', () => {

			let creditcard = MockEntities.getValidCreditCard();

			let names = [
				{},
				[],
				123,
				null
			];

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			arrayutilities.map(names, name => {
				creditcard.name = name;
				expect(creditCardHelperController.getFirstName(creditcard)).to.equal(null);
			});

		});

	});

	describe('getLastName', () => {

		it('returns null', () => {

			let creditcard = MockEntities.getValidCreditCard();

			let names = [
				{},
				[],
				123,
				null
			];

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			arrayutilities.map(names, name => {
				creditcard.name = name;
				expect(creditCardHelperController.getLastName(creditcard)).to.equal(null);
			});

		});

		it('retrieves the lastname of a creditcard', () => {

			let creditcard = MockEntities.getValidCreditCard();

			let names = [
				' John Jacob Jingle-Heimer-Schmidtt',
				' John Jacob Jingle-Heimer-Schmidtt ',
				'    John       Jacob Jingle-Heimer-Schmidtt    '
			];

			let CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
			const creditCardHelperController = new CreditCardHelperController();

			arrayutilities.map(names, name => {
				creditcard.name = name;
				expect(creditCardHelperController.getLastName(creditcard)).to.equal('Jingle-Heimer-Schmidtt');
			});

		});

	});

});
