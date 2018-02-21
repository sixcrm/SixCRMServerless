'use strict'

let chai = require('chai');
const expect = chai.expect;

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

describe('controllers/helpers/entities/customer/Customer.js', () => {

  describe('getFullName', () => {

    it('successfully retrieves customer\'s full name', () => {

      let customer = MockEntities.getValidCustomer();

      const CustomerHelperController = global.SixCRM.routes.include('helpers','entities/customer/Customer.js');
      let customerHelperController = new CustomerHelperController();

      expect(customerHelperController.getFullName(customer)).to.equal(customer.firstname + ' ' + customer.lastname);

    });

    it('successfully retrieves customer\'s first name', () => {

      let customer = MockEntities.getValidCustomer();

      delete customer.lastname;

      const CustomerHelperController = global.SixCRM.routes.include('helpers','entities/customer/Customer.js');
      let customerHelperController = new CustomerHelperController();

      expect(customerHelperController.getFullName(customer)).to.equal(customer.firstname);

    });

    it('successfully retrieves customer\'s last name', () => {

      let customer = MockEntities.getValidCustomer();

      delete customer.firstname;

      const CustomerHelperController = global.SixCRM.routes.include('helpers','entities/customer/Customer.js');
      let customerHelperController = new CustomerHelperController();

      expect(customerHelperController.getFullName(customer)).to.equal(customer.lastname);

    });

    it('returns empty string when customer\'s name is undefined', () => {

      let customer = MockEntities.getValidCustomer();

      delete customer.firstname;
      delete customer.lastname;

      const CustomerHelperController = global.SixCRM.routes.include('helpers','entities/customer/Customer.js');
      let customerHelperController = new CustomerHelperController();

      expect(customerHelperController.getFullName(customer)).to.equal('');

    });

  });

});
