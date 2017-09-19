'use strict'
const chai = require('chai');

chai.use(require('chai-json-schema'));
const expect = require('chai').expect

const LoadBalancerTest = global.SixCRM.routes.include('test', 'integration/classes/LoadBalancer');

describe('Load Balancer (Product) Delete Block Test', () => {

  it('Should not allow the delete', () => {

    let loadBalancerTest = new LoadBalancerTest();

    return loadBalancerTest.executeProductScheduleBlockTest().then(results => {

      return expect(results.statusCode).to.equal(200);

    });

  });

});
