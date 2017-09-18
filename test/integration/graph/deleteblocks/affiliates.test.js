'use strict'
const chai = require('chai');

chai.use(require('chai-json-schema'));
const expect = require('chai').expect

const AffiliateTest = global.SixCRM.routes.include('test', 'integration/classes/Affiliate');

describe('Affiliate (Tracker) Delete Block Test', () => {

  it('Should not allow the delete', () => {

    let affiliateTest = new AffiliateTest();

    return affiliateTest.executeTrackerBlockTest().then(results => {

      return expect(results.statusCode).to.equal(200);

    });

  });

});

describe('Affiliate (Campaign) Delete Block Test', () => {

  it('Should not allow the delete', () => {

    let affiliateTest = new AffiliateTest();

    return affiliateTest.executeCampaignBlockTest().then(results => {

      return expect(results.statusCode).to.equal(200);

    });

  });

});

describe('Affiliate (Session) Delete Block Test', () => {

  it('Should not allow the delete', () => {

    let affiliateTest = new AffiliateTest();

    return affiliateTest.executeSessionBlockTest().then(results => {

      return expect(results.statusCode).to.equal(200);

    });

  });

});
