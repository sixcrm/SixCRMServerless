'use strict'
const chai = require('chai');

chai.use(require('chai-json-schema'));
const expect = require('chai').expect

const ProductScheduleTest = global.SixCRM.routes.include('test', 'integration/classes/ProductSchedule');

describe('Product Schedule (Campaign) Delete Block Test', () => {

  it('Should not allow the delete', () => {

    let productScheduleTest = new ProductScheduleTest();

    return productScheduleTest.executeCampaignBlockTest().then(results => {

      return expect(results.statusCode).to.equal(200);

    });

  });

});

describe('Product Schedule (Rebill) Delete Block Test', () => {

  it('Should not allow the delete', () => {

    let productScheduleTest = new ProductScheduleTest();

    return productScheduleTest.executeRebillBlockTest().then(results => {

      return expect(results.statusCode).to.equal(200);

    });

  });

});
