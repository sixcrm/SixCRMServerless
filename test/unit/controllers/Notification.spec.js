const PermissionTestGenerators = require('../lib/permission-test-generators');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

describe('controllers/Notification.js', () => {

    describe('count notifications', () => {
        before(() => {
            mockery.enable({
                useCleanCache: true,
                warnOnReplace: false,
                warnOnUnregistered: false
            });
        });

        afterEach(() => {
            mockery.resetCache();
        });

        after(() => {
            mockery.deregisterAll();
            global.disableactionchecks = false;
        });

        it('should return number of notifications after last seen date', () => {
            // given
            global.disableactionchecks = true;
            PermissionTestGenerators.givenAnyUser();

            mockery.registerMock(global.routes.path('lib', 'dynamodb-utilities.js'), {
                countRecords: (table, parameters, index, callback) => {
                    callback(null, 2);
                },
                get: (table, key, callback) => {
                    callback(null, {
                        id: "nikola.bosic@toptal.com/*",
                        created_at: "2017-04-06T18:40:41.405Z",
                        updated_at: "2017-04-06T18:41:12.521Z"
                    })
                },
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, { Items: [] })
                },
                queryRecordsFull: (table, parameters, index, callback) => {
                    callback(null, { Items: [] })
                },
                saveRecord: (table, item, callback) => {
                    callback();
                }
            });
            mockery.registerMock(global.routes.path('lib', 'indexing-utilities.js'), {
                addToSearchIndex: () => {
                    return Promise.resolve(true);
                }
            });
            mockery.registerMock(global.routes.path('lib', 'kinesis-firehose-utilities.js'), {
                putRecord: () => {
                    return Promise.resolve();
                }
            });

            let notificationController = global.routes.include('controllers','entities/Notification');

            // when
            return notificationController.numberOfUnseenNotifications().then((count) => {
                // then
                return expect(count).to.deep.equal({ count: 2});
            });

        });

    });

});
