let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

function getValidAffiliate() {
    return {
        "id":"6b6331f6-7f84-437a-9ac6-093ba301e455",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "name": "Seed Affiliate",
        "affiliate_id":"whatever",
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }
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

            let affiliateController = global.SixCRM.routes.include('controllers','entities/Affiliate.js');

            return affiliateController.getByAffiliateID(affiliate.id).then((result) => {
                expect(result).to.deep.equal(affiliate);
            });
        });
    });
});
