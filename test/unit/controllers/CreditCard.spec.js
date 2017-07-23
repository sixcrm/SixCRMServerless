let chai = require('chai');
let expect = chai.expect;

describe('controllers/CreditCard.js', () => {

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

});
