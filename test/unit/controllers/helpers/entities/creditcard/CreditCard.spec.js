'use strict'

let chai = require('chai');
const expect = chai.expect;
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

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
  });

  describe('getExpirationMonth', () => {
    it('successfully acquires expiration month in variety of formats', () => {

      let expirations = ['0420','0420','04/20','04/2020','4/2020', '420', '0420', '042020','42020'];

      let creditCardHelperController = new CreditCardHelperController();

      arrayutilities.map(expirations, expiration => {
        expect(creditCardHelperController.getExpirationMonth({expiration: expiration})).to.equal('04');
      })

    });
  });
});
