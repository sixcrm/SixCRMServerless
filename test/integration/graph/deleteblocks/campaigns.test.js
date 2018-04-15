
const chai = require('chai');

chai.use(require('chai-json-schema'));
const expect = require('chai').expect

const CampaignTest = global.SixCRM.routes.include('test', 'integration/classes/Campaign');

describe('Campaign (Tracker) Delete Block Test', () => {

	it('Should not allow the delete', () => {

		let campaignTest = new CampaignTest();

		return campaignTest.executeTrackerBlockTest().then(results => {

			return expect(results.statusCode).to.equal(200);

		});

	});

});
