let chai = require('chai');
let expect = chai.expect;

function getValidCreditCard() {
    return {
        "id": "df84f7bb-06bd-4daa-b1a3-6a2c113edd72",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "address": {
            "city": "Portland",
            "country": "US",
            "line1": "10 Skid Rw.",
            "line2": "Suite 100",
            "state": "OR",
            "zip": "97213"
        },
        "number": "4111111111111111",
        "ccv": "999",
        "expiration": "1025",
        "name": "Rama Damunaste",
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }
}

describe('controllers/entities/CreditCard.js', () => {

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

            let creditCardController = global.SixCRM.routes.include('controllers','entities/CreditCard');

            expect(creditCardController.getBINNumber(creditCard)).to.equal('411111');
        });

        it('returns credit card number', () => {

            let creditCard = getValidCreditCard();

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

            let testCreditCard = getValidCreditCard();

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
                expect(error.message).to.equal('[500] Cards do not match.  Bad field: expiration')
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
});
