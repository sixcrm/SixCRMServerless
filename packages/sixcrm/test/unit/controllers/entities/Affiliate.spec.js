let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidAffiliate() {
	return MockEntities.getValidAffiliate()
}

describe('controllers/Affiliate.js', () => {

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

	after(() => {
		mockery.disable();
	});

	describe('getByAffiliateID', () => {

		it('successfully retrieves affiliate', () => {
			let affiliate = getValidAffiliate();

			let mock_entity = class {
				constructor(){}

				getBySecondaryIndex({field, index_value, index_name}) {
					expect(field).to.equal('affiliate_id');
					expect(index_value).to.equal(affiliate.id);
					expect(index_name).to.equal('affiliate_id-index');
					return Promise.resolve(affiliate);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Entity.js'), mock_entity);

			let AffiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');
			const affiliateController = new AffiliateController();

			return affiliateController.getByAffiliateID(affiliate.id).then((result) => {
				expect(result).to.deep.equal(affiliate);
			});
		});
	});
});
