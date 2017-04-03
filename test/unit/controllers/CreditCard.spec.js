let chai = require('chai');
let expect = chai.expect;

describe('controllers/CreditCard.js', () => {

    it('creates credit card object', () => {
        // given
        let creditCardData = {
            ccnumber: '1',
            ccexpiration: '01/18',
            ccccv: '2',
            name: 'N',
            addres: 'A'
        };
        let creditCardController = require('../../../controllers/CreditCard');

        // when
        let creditCardObject = creditCardController.createCreditCardObject(creditCardData);

        // then
        return creditCardObject.then((data) => {
            expect(data).to.deep.equal({
                ccnumber: creditCardData.ccnumber,
                expiration: creditCardData.ccexpiration,
                ccv: creditCardData.ccccv,
                name: creditCardData.name,
                address: creditCardData.address
            });
        });
    });

});
