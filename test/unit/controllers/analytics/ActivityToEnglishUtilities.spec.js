let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

describe('controllers/ActivityToEnglishUtilities.js', () => {

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

    describe('getSystemObject', () => {

        it('successfully retrieves system object', () => {

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            expect(aceuController.getSystemObject()).to.deep.equal({
                id: 'system',
                name: 'SixCRM'
            });
        });
    });

    describe('setActivityRow', () => {

        it('successfully sets activity row', () => {

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({an_activity_row: 'an_activity_row'});

            aceuController.getSystemObject();

            expect(aceuController.activity_row).to.deep.equal({an_activity_row: 'an_activity_row'});
        });
    });

    describe('setEnglishTemplate', () => {

        it('successfully sets english template with "actor_only"', () => {

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            return aceuController.setEnglishTemplate().then((result) => {
                expect(result).to.be.true;
                expect(aceuController.english_template)
                    .to.equal(aceuController.statement_templates.actor_only);
            });
        });

        it('successfully sets english template with "actor_and_acted_upon"', () => {

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            //prepare necessary data for test
            aceuController.acted_upon = 'any_acted_upon_data';

            return aceuController.setEnglishTemplate().then((result) => {
                expect(result).to.be.true;
                expect(aceuController.english_template)
                    .to.equal(aceuController.statement_templates.actor_and_acted_upon);
            });
        });

        it('successfully sets english template with "actor_and_acted_upon_and_associated_with"', () => {

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            //prepare necessary data for test
            aceuController.associated_with = 'any_associated_with_data';
            aceuController.acted_upon = 'any_acted_upon_data';

            return aceuController.setEnglishTemplate().then((result) => {
                expect(result).to.be.true;
                expect(aceuController.english_template)
                    .to.equal(aceuController.statement_templates.actor_and_acted_upon_and_associated_with);
            });
        });
    });

    describe('validateActivityRow', () => {

        it('throws validation error', () => {

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController('an_activity_row');

            return aceuController.validateActivityRow().catch((error) => {
                expect(error.message).to.contain('[500] One or more validation errors occurred');
            });
        });

        it('successfully sets activity row', () => {

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            return aceuController.validateActivityRow().then((result) => {
                expect(result).to.be.true;
            });
        });
    });

    describe('buildObject', () => {

        it('successfully builds object', () => {

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            //prepare necessary data for test
            aceuController.actor = 'an_actor';
            aceuController.acted_upon = 'an_acted_upon_data';
            aceuController.associated_with = 'an_associated_with';
            aceuController.english_template = 'an_english_template';

            return aceuController.buildObject().then((result) => {
                expect(result).to.equal('{' +
                    '"actor":"an_actor",' +
                    '"acted_upon":"an_acted_upon_data",' +
                    '"associated_with":"an_associated_with",' +
                    '"english_template":"an_english_template"' +
                '}');
            });
        });
    });

    describe('get', () => {

        it('returns true when type of activity row exists', () => {

            let dummy_id = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
                queryRecords(table, parameters) {
                    expect(table).to.equal('entities');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(dummy_id);
                    return Promise.resolve({Items: [{id: dummy_id}]});
                }
            });

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            aceuController.activity_row = {
                test: dummy_id,
                test_type: 'entity'
            };

            return aceuController.get('test').then((result) => {
                expect(result).to.be.true;
            });
        });

        it('returns null when type of activity row does not exists', () => {

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            return aceuController.get('test').then((result) => {
                expect(result).to.equal(null);
            });
        });

        it('returns system object when activity row type is system', () => {

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            aceuController.activity_row = {
                test: 'system'
            };

            return aceuController.get('test').then((result) => {
                expect(result).to.to.deep.equal({
                    id: 'system',
                    name: 'SixCRM'
                });
            });
        });

        it('returns true when type is successfully set', () => {

            let dummy_id = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
                queryRecords(table, parameters) {
                    expect(table).to.equal('entities');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(dummy_id);
                    return Promise.resolve({Items: [{}]});
                }
            });

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            aceuController.activity_row = {
                test: dummy_id,
                test_type: 'entity'
            };

            return aceuController.get('test').then((result) => {
                expect(result).to.be.true;
            });
        });

        it('throws error when entity retrieval failed', () => {

            let dummy_id = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
                queryRecords(table, parameters) {
                    expect(table).to.equal('entities');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(dummy_id);
                    return Promise.reject(new Error('Failed to retrieve an entity'));
                }
            });

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            aceuController.activity_row = {
                test: dummy_id,
                test_type: 'entity'
            };

            return aceuController.get('test').catch((error) => {
                expect(error.message).to.equal('[500] Failed to retrieve an entity');
            });
        });
    });

    describe('gets resources', () => {

        let dummy_id = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

        beforeEach(() => {

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
                queryRecords(table, parameters) {
                    expect(table).to.equal('entities');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(dummy_id);
                    return Promise.resolve({Items: [{id: dummy_id}]});
                }
            });
        });

        it('successfully retrieves an entity', () => {

            let params = {
                id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
                type: 'entity'
            };

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            return aceuController.getEntity(params).then((result) => {
                expect(result).to.deep.equal({id: params.id});
            });
        });

        it('successfully retrieves an actor', () => {

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            aceuController.activity_row = {
                actor: dummy_id,
                actor_type: 'entity'
            };

            return aceuController.getActor().then((result) => {
                expect(result).to.be.true;
            });
        });

        it('successfully retrieves "associated with"', () => {

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            aceuController.activity_row = {
                associated_with: dummy_id,
                associated_with_type: 'entity'
            };

            return aceuController.getAssociatedWith().then((result) => {
                expect(result).to.be.true;
            });
        });

        it('successfully retrieves "acted upon"', () => {

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            aceuController.activity_row = {
                acted_upon: dummy_id,
                acted_upon_type: 'entity'
            };

            return aceuController.getActedUpon().then((result) => {
                expect(result).to.be.true;
            });
        });

        it('successfully acquires resources', () => {

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            aceuController.activity_row = {
                actor: dummy_id,
                actor_type: 'entity',
                acted_upon: dummy_id,
                acted_upon_type: 'entity',
                associated_with: dummy_id,
                associated_with_type: 'entity'
            };

            return aceuController.acquireResources().then((result) => {
                expect(result).to.be.true;
            });
        });
    });

    describe('builds/appends activity english object', () => {

        let dummy_id = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

        let english_string = '{' +
            '"actor":{' +
            '"id":"' + dummy_id + '"' +
            '},' +
            '"acted_upon":{' +
            '"id":"' + dummy_id + '"' +
            '},' +
            '"associated_with":{' +
            '"id":"' + dummy_id + '"' +
            '},' +
            '"english_template":"{actor} {action} {acted_upon} associated with {associated_with}."' +
            '}';

        beforeEach(() => {

            PermissionTestGenerators.givenUserWithAllowed('read', 'entity');

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
                queryRecords(table, parameters) {
                    expect(table).to.equal('entities');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(dummy_id);
                    return Promise.resolve({Items: [{id: dummy_id}]});
                }
            });
        });

        it('builds activity english object', () => {

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            aceuController.activity_row = {
                actor: dummy_id,
                actor_type: 'entity',
                acted_upon: dummy_id,
                acted_upon_type: 'entity',
                associated_with: dummy_id,
                associated_with_type: 'entity'
            };

            //prepare necessary data for test
            aceuController.actor = aceuController.activity_row.actor;
            aceuController.acted_upon = aceuController.activity_row.acted_upon;
            aceuController.associated_with = aceuController.activity_row.associated_with;

            return aceuController.buildActivityEnglishObject().then((result) => {
                expect(result).to.equal(english_string);
            });
        });

        it('appends activity english object', () => {

            let ActivityToEnglishUtilitiesController = global.SixCRM.routes.include('controllers', 'analytics/ActivityToEnglishUtilities.js');
            let aceuController = new ActivityToEnglishUtilitiesController({});

            aceuController.activity_row = {
                actor: dummy_id,
                actor_type: 'entity',
                acted_upon: dummy_id,
                acted_upon_type: 'entity',
                associated_with: dummy_id,
                associated_with_type: 'entity'
            };

            //prepare necessary data for test
            aceuController.actor = aceuController.activity_row.actor;
            aceuController.acted_upon = aceuController.activity_row.acted_upon;
            aceuController.associated_with = aceuController.activity_row.associated_with;

            return aceuController.appendActivityEnglishObject().then((result) => {
                expect(result).to.deep.equal({
                    actor: dummy_id,
                    actor_type: 'entity',
                    acted_upon: dummy_id,
                    acted_upon_type: 'entity',
                    associated_with: dummy_id,
                    associated_with_type: 'entity',
                    english: english_string
                });
            });
        });
    });
});
