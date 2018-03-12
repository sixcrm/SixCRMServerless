let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidCreditCard() {
    return MockEntities.getValidCreditCard()
}

describe('controllers/entities/CreditCard.js', () => {
    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    afterEach(() => {
        mockery.resetCache();
        mockery.deregisterAll();
    });

    it('creates credit card object', () => {
        // given
        let creditCardData = {
            number: '1',
            expiration: '01/18',
            ccv: '2',
            name: 'N',
            address: 'A'
        };
        let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

        // when
        let creditCardObject = creditCardController.createCreditCardObject(creditCardData);

        // then
        return creditCardObject.then((data) => {
            expect(data).to.deep.equal({
                number: creditCardData.number,
                expiration: creditCardData.expiration,
                ccv: creditCardData.ccv,
                name: creditCardData.name,
                address: creditCardData.address
            });
        });
    });

    describe('getBINNumber', () => {

        it('retrieves BIN number from credit card', () => {

            let creditCard = getValidCreditCard();

            creditCard.number = '411111';

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            expect(creditCardController.getBINNumber(creditCard)).to.equal('411111');
        });

        it('returns credit card number', () => {

            let creditCard = getValidCreditCard();

            creditCard.number = '411111';

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            expect(creditCardController.getBINNumber(creditCard.number)).to.equal('411111');
        });

        it('returns null when credit card number is a number', () => {

            let creditCard_number = 111111; //any number

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            expect(creditCardController.getBINNumber(creditCard_number)).to.equal(null);
        });

        it('returns null when credit card number is an array', () => {

            let creditCard_number = [];

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            expect(creditCardController.getBINNumber(creditCard_number)).to.equal(null);
        });

        it('returns null when credit card number is an object', () => {

            let creditCard_number = {};

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            expect(creditCardController.getBINNumber(creditCard_number)).to.equal(null);
        });

        it('returns null when credit card number is negative number', () => {

            let creditCard_number = -1111; //any negative number

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            expect(creditCardController.getBINNumber(creditCard_number)).to.equal(null);
        });

        it('returns null when credit card number is decimal number', () => {

            let creditCard_number = 11.123; //any decimal number

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            expect(creditCardController.getBINNumber(creditCard_number)).to.equal(null);
        });
    });

    describe('sameCard', () => {

        it('returns true when credit cards are the same', () => {

            let creditCard = getValidCreditCard();

            let testCreditCard = creditCard;

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            expect(creditCardController.sameCard(creditCard, testCreditCard)).to.be.true;
        });

        it('returns false when test card is missing expected field', () => {

            let creditCard = getValidCreditCard();

            let testCreditCard = getValidCreditCard();

            delete testCreditCard.expiration;

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            expect(creditCardController.sameCard(creditCard, testCreditCard)).to.be.false;
        });

        it('returns false when test card has a mismatching field type', () => {

            let creditCard = getValidCreditCard();

            let testCreditCard = getValidCreditCard();

            testCreditCard.expiration = 1025; //unexpected type

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            expect(creditCardController.sameCard(creditCard, testCreditCard)).to.be.false;
        });

        it('returns false when a field from a test card has a different value', () => {

            let creditCard = getValidCreditCard();

            let testCreditCard = getValidCreditCard();

            testCreditCard.expiration = '1234';

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            expect(creditCardController.sameCard(creditCard, testCreditCard)).to.be.false;
        });

        it('returns false when an object from a test card is not a match', () => {

            let creditCard = getValidCreditCard();

            let testCreditCard = getValidCreditCard();

            testCreditCard.address = {
                "city": "Paris"
            };

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            expect(creditCardController.sameCard(creditCard, testCreditCard)).to.be.false;
        });

        it('throws error when cards do not match', () => {

            let creditCard = getValidCreditCard();

            let testCreditCard = getValidCreditCard();

            testCreditCard.expiration = '1234';

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            try{
                creditCardController.sameCard(creditCard, testCreditCard, true);
            }catch (error){
                expect(error.message).to.equal('[500] Cards do not match.  Bad field: id')
            }
        });
    });

    describe('getAddress', () => {

        it('successfully retrieves address from credit card', () => {

            let creditCard = getValidCreditCard();

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            return creditCardController.getAddress(creditCard).then((result) => {
                expect(result).to.equal(creditCard.address);
            });
        });
    });

    describe('censorEncryptedAttribute', () => {
        it('returns the last 4 digits of number', () => {
            const number = '4111 1111 1111 1111';

            class mockHelper {
                lastFour(input) {
                    expect(input).to.equal(number);
                    return '************1111';
                }
            }

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/creditcard/CreditCard.js'), mockHelper);

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            creditCardController.decryptAttribute = (attr) => {
                expect(attr).to.equal('encrypted_number');
                return number;
            }

            expect(creditCardController.censorEncryptedAttribute('number', 'encrypted_number')).to.equal('************1111')
        });

        it('returns generic censor for other attributes', () => {
            const ccv = '123';

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            expect(creditCardController.censorEncryptedAttribute('ccv', ccv)).to.equal('********')
        });
    });
});
