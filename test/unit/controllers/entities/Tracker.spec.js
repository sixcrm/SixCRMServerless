const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

function getValidTracker() {
    return {
        "id":"8cf59d00-460b-42ad-b6be-d520975f27db",
        "campaigns":["70a6689a-5814-438b-b9fd-dd484d0812f9"],
        "affiliates":["6b6331f6-7f84-437a-9ac6-093ba301e455", "ad58ea78-504f-4a7e-ad45-128b6e76dc57"],
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "type":"postback",
        "event_type":["lead", "main", "upsell"],
        "name":"Testing Tracker 1",
        "body":"http://whatever.com/{{transaction.id}}?c={{session.id}}",
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }
}

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

function getValidCampaign() {
    return {
        "id":"70a6689a-5814-438b-b9fd-dd484d0812f9",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "name": "Example Campaign",
        "allow_prepaid": false,
        "show_prepaid": false,
        "productschedules":["12529a17-ac32-4e46-b05b-83862843055d","8d1e896f-c50d-4a6b-8c84-d5661c16a046"],
        "emailtemplates":["b44ce483-861c-4843-a7d6-b4c649d6bdde","8108d6a3-2d10-4013-9e8e-df71e2dc578b","102131a0-4cc4-4463-a614-e3157c3f03c2"],
        "affiliate_allow":["ad58ea78-504f-4a7e-ad45-128b6e76dc57"],
        "affiliate_deny":["*"],
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }
}

describe('controllers/Tracker.js', () => {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    beforeEach(() => {
        mockery.resetCache();
    });

    afterEach(() => {
        mockery.deregisterAll();
    });

    describe('getAffiliates', () => {

        it('successfully retrieves affiliates', () => {

            let tracker = getValidTracker();

            let affiliate = getValidAffiliate();

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Affiliate.js'), {
                listBy: ({list_array}) => {
                    expect(list_array).to.deep.equal(tracker.affiliates);
                    return Promise.resolve({affiliates: [affiliate]});
                }
            });

            let trackerController = global.SixCRM.routes.include('controllers','entities/Tracker.js');

            return trackerController.getAffiliates(tracker).then((result) => {
                expect(result).to.deep.equal([affiliate]);
            });
        });

        it('returns null when tracker does not have affiliates', () => {

            let tracker = getValidTracker();

            delete tracker.affiliates;

            let trackerController = global.SixCRM.routes.include('controllers','entities/Tracker.js');

            expect(trackerController.getAffiliates(tracker)).to.deep.equal(null);
        });
    });

    describe('getCampaigns', () => {

        it('successfully retrieves campaigns', () => {

            let tracker = getValidTracker();

            let campaign = getValidCampaign();

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Campaign.js'), {
                listBy: ({list_array}) => {
                    expect(list_array).to.deep.equal(tracker.campaigns);
                    return Promise.resolve({campaigns: [campaign]});
                }
            });

            let trackerController = global.SixCRM.routes.include('controllers','entities/Tracker.js');

            return trackerController.getCampaigns(tracker).then((result) => {
                expect(result).to.deep.equal([campaign]);
            });
        });

        it('returns null when tracker does not have campaigns', () => {

            let tracker = getValidTracker();

            delete tracker.campaigns;

            let trackerController = global.SixCRM.routes.include('controllers','entities/Tracker.js');

            expect(trackerController.getCampaigns(tracker)).to.deep.equal(null);
        });
    });

    describe('listByCampaign', () => {

        it('lists trackers by campaign', () => {

            let tracker = getValidTracker();

            let campaign = getValidCampaign();

            PermissionTestGenerators.givenUserWithAllowed('read', 'tracker');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('trackers');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':id']).to.equal(campaign.id);
                    return Promise.resolve({
                        Count: 1,
                        Items: [tracker]
                    });
                }
            });

            let trackerController = global.SixCRM.routes.include('controllers','entities/Tracker.js');

            return trackerController.listByCampaign({campaign: campaign, pagination: 0}).then((result) => {
                expect(result).to.deep.equal({
                    trackers: [tracker],
                    pagination: {
                        count: 1,
                        end_cursor: "",
                        has_next_page: "false",
                        last_evaluated: ""
                    }
                });
            });
        });
    });

    describe('listByAffiliate', () => {

        it('lists trackers by affiliate', () => {

            let tracker = getValidTracker();

            let affiliate = getValidAffiliate();

            PermissionTestGenerators.givenUserWithAllowed('read', 'tracker');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    expect(index).to.equal('account-index');
                    expect(table).to.equal('trackers');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':id']).to.equal(affiliate.id);
                    return Promise.resolve({
                        Count: 1,
                        Items: [tracker]
                    });
                }
            });

            let trackerController = global.SixCRM.routes.include('controllers','entities/Tracker.js');

            return trackerController.listByAffiliate({affiliate: affiliate, pagination: 0}).then((result) => {
                expect(result).to.deep.equal({
                    trackers: [tracker],
                    pagination: {
                        count: 1,
                        end_cursor: "",
                        has_next_page: "false",
                        last_evaluated: ""
                    }
                });
            });
        });
    });
});