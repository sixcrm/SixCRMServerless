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

            //Technical Debt:  Fix...
            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                get: (table, key) => {
                  return Promise.resolve({
                    id: "nikola.bosic@toptal.com/*",
                    created_at: "2017-04-06T18:40:41.405Z",
                    updated_at: "2017-04-06T18:41:12.521Z"
                  })
                },
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve({ Items: [], Count: 2})
                },
                saveRecord: (table, item) => {
                    return Promise.resolve({});
                }

            });

            let mock_preindexing_helper = class {
              constructor(){

              }
              addToSearchIndex(entity){
                return Promise.resolve(true);
              }
              removeFromSearchIndex(entity){
                return Promise.resolve(true);
              }
            }

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

            mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities.js'), {
                putRecord: () => {
                    return Promise.resolve();
                }
            });

            let notificationController = global.SixCRM.routes.include('controllers','entities/Notification');

            // when
            return notificationController.numberOfUnseenNotifications().then((count) => {
                // then
                return expect(count).to.deep.equal({ count: 2});
            });

        });

    });

});
