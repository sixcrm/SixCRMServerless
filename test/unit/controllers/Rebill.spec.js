const PermissionTestGenerators = require('../lib/permission-test-generators');
const TimestampUtils = require('../../../lib/timestamp');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

describe('controllers/Rebill.js', () => {
    const oneDayInSeconds = 86400;

    function nowInSeconds() {
        return Math.floor(Date.now() / 1000);
    }

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
    });

    describe('calculate rebill', () => {
        let rebillController;

        before(() => {
            rebillController = global.routes.include('controllers','entities/Rebill');
        });

        it('should calculate rebill', () => {
            // given
            let aProductSchedule = {
                schedule: [
                    {
                        start: 1,
                        end: 30,
                        period: 1,
                        product_id: 42,
                        price: 100
                    }
                ]
            };
            let aDayInCycle = 2;

            // when
            let rebill = rebillController.calculateRebill(aDayInCycle, aProductSchedule);

            // then
            expect(rebill.bill_at).to.equal(TimestampUtils.toISO8601((aProductSchedule.schedule[0].period * oneDayInSeconds) + nowInSeconds()));
            expect(rebill.product).to.be.equal(aProductSchedule.schedule[0].product_id);
            expect(rebill.amount).to.be.equal(aProductSchedule.schedule[0].price);
        });

        it('should calculate rebill for schedules with no end', () => {
            // given
            let aProductSchedule = {
                schedule: [
                    {
                        start: 1,
                        period: 1,
                        product_id: 42,
                        price: 100
                    }
                ]
            };
            let aDayInCycle = 2;

            // when
            let rebill = rebillController.calculateRebill(aDayInCycle, aProductSchedule);

            // then
            expect(rebill.bill_at).to.equal(TimestampUtils.toISO8601((aProductSchedule.schedule[0].period * oneDayInSeconds) + nowInSeconds()));
            expect(rebill.product).to.be.equal(aProductSchedule.schedule[0].product_id);
            expect(rebill.amount).to.be.equal(aProductSchedule.schedule[0].price);
        });

        it('should calculate rebill for first eligible schedule', () => {
            // given
            let aProductSchedule = {
                schedule: [
                    { // not eligible
                        start: 15,
                        end: 30,
                        period: 1,
                        product_id: 42,
                        price: 100
                    },
                    { // not eligible
                        start: 15,
                        end: 30,
                        period: 1,
                        product_id: 66,
                        price: 200
                    },
                    { // eligible
                        start: 1,
                        end: 30,
                        period: 1,
                        product_id: 99,
                        price: 300
                    }
                ]
            };
            let aDayInCycle = 2;

            // when
            let rebill = rebillController.calculateRebill(aDayInCycle, aProductSchedule);

            // then
            expect(rebill.bill_at).to.equal(TimestampUtils.toISO8601((aProductSchedule.schedule[2].period * oneDayInSeconds) + nowInSeconds()));
            expect(rebill.product).to.be.equal(aProductSchedule.schedule[2].product_id);
            expect(rebill.amount).to.be.equal(aProductSchedule.schedule[2].price);
        });

        it('returns false when a day in cycle is after the end of schedule', () => {
            // given
            let aProductSchedule = {
                schedule: [
                    {
                        start: 1,
                        end: 30,
                        period: 1,
                        product_id: 42,
                        price: 100
                    }
                ]
            };
            let aDayInCycle = 31;

            // when
            let rebill = rebillController.calculateRebill(aDayInCycle, aProductSchedule);

            // then
            expect(rebill).to.be.false;
        });

        it('returns false when a day in cycle is before the start of schedule', () => {
            // given
            let aProductSchedule = {
                schedule: [
                    {
                        start: 15,
                        end: 30,
                        period: 1,
                        product_id: 42,
                        price: 100
                    }
                ]
            };
            let aDayInCycle = 2;

            // when
            let rebill = rebillController.calculateRebill(aDayInCycle, aProductSchedule);

            // then
            expect(rebill).to.be.false;
        });
    });

    describe('create rebill', () => {
        it('fails when user is not set', () => {
            // given
            global.user = null;
            let aSession = givenAnySession();
            let aProductSchedule = givenAnyProductSchedule();
            let aDayInCycle = givenAnyDayInCycle();
            let rebillController = global.routes.include('controllers', 'entities/Rebill.js');

            // when
            return rebillController.createRebill(aSession, aProductSchedule, aDayInCycle).catch((error) => {
                // then
                expect(error.message).to.be.defined;
            });
        });

        it('fails when user does not have permissions', () => {
            // given
            PermissionTestGenerators.givenUserWithNoPermissions();

            let aSession = givenAnySession();
            let aProductSchedule = givenAnyProductSchedule();
            let aDayInCycle = givenAnyDayInCycle();

            mockery.registerMock(global.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, []);
                },
                saveRecord: (table, entity, callback) => {
                    callback(null, entity);
                }
            });
            mockery.registerMock(global.routes.path('lib', 'indexing-utilities.js'), {
                addToSearchIndex: (entity, entity_type) => {
                    return new Promise((resolve) => {
                        resolve(true);
                    });
                }
            });

            let rebillController = global.routes.include('controllers', 'entities/Rebill.js');

            // when
            return rebillController.createRebill(aSession, aProductSchedule, aDayInCycle).catch((error) => {
                // then
                expect(error.message).to.equal('Invalid Permissions: user can not create on rebill');
            });
        });

        it('creates a rebill with a date in the future', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('create','rebill');
            let aSession = givenAnySession();
            let aProductSchedule = givenAnyProductSchedule();
            let aDayInCycle = givenAnyDayInCycle();

            mockery.registerMock(global.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, []);
                },
                saveRecord: (table, entity, callback) => {
                    callback(null, entity);
                }
            });
            mockery.registerMock(global.routes.path('lib', 'indexing-utilities.js'), {
                addToSearchIndex: (entity, entity_type) => {
                    return new Promise((resolve) => {
                        resolve(true);
                    });
                }
            });

            let rebillController = global.routes.include('controllers', 'entities/Rebill.js');

            // when
            return rebillController.createRebill(aSession, aProductSchedule, aDayInCycle).then((rebill) => {
                expect(rebill.id).to.have.lengthOf(36);
                expect(rebill.bill_at).to.equal(TimestampUtils.toISO8601(nowInSeconds() + aProductSchedule.schedule[0].period * oneDayInSeconds));
            });
        });
    });

    describe('buildRebillObject', () => {
        it('returns an object with correct parameters', () => {
            // given
            let parameters = {
                bill_at: TimestampUtils.getISO8601(),
                parentsession: '1',
                product_schedules: [],
                amount: 100
            };


            let rebillController = global.routes.include('controllers', 'entities/Rebill.js');

            // when
            let rebillObject = rebillController.buildRebillObject(parameters);

            // then
            expect(rebillObject.id).to.have.lengthOf(36); // UUIDv4 is 36 characters long
            expect(rebillObject.bill_at).to.equal(parameters.bill_at);
            expect(rebillObject.parentsession).to.equal(parameters.parentsession);
            expect(rebillObject.product_schedules).to.equal(parameters.product_schedules);
            expect(rebillObject.amount).to.equal(parameters.amount);
        });
    });

    describe('should calculate day in cycle', () => {
        let rebillController;

        before(() => {
            rebillController = global.routes.include('controllers', 'entities/Rebill.js');
        });

        it('for today', () => {
            expect(rebillController.calculateDayInCycle(nowInSeconds())).to.equal(0);
        });

        it('for tomorrow', () => {
            expect(rebillController.calculateDayInCycle(nowInSeconds() + oneDayInSeconds)).to.equal(-1);
        });

        it('for yesterday', () => {
            expect(rebillController.calculateDayInCycle(nowInSeconds() - oneDayInSeconds)).to.equal(1);
        });
    });

    describe('addRebillToQueue', () => {
        after(() => {
            mockery.deregisterAll();
        });

        it('should add a rebill to bill queue', () => {
            // given
            let aRebill = { id: '4b67d096-7404-42b2-94f8-78e6304c6527', created_at: TimestampUtils.getISO8601(), updated_at: TimestampUtils.getISO8601() };

            process.env.bill_queue_url = 'tesbill';
            process.env.bill_failed_queue_url = 'testfailbill';
            process.env.hold_queue_url = 'testhold';
            process.env.search_indexing_queue_url = 'url';

            // mock sqs utilities that always succeed
            mockery.registerMock(global.routes.path('lib', 'sqs-utilities.js'), {
                sendMessage: (parameters, callback) => {
                    callback(null, {});
                    expect(parameters.queue_url).to.equal(process.env.bill_queue_url); // expect queue url to be correct
                }

            });

            // mock permission utilities that always allow the action
            mockery.registerMock(global.routes.path('lib', 'permission-utilities.js'), {
                validatePermissions: (action, entity) => {
                    return new Promise((resolve) => resolve(true));
                }

            });

            // mock dynamodb utilities that return a single rebill and save always succeeds
            mockery.registerMock(global.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, [aRebill]);
                },
                saveRecord: (table, entity, callback) => {
                    callback(null, entity);
                }
            });

            let rebillController = global.routes.include('controllers', 'entities/Rebill.js');

            // when

            return rebillController.addRebillToQueue(aRebill, 'bill').then(() => {
                // then
                expect(aRebill.processing).to.be.equal('true');
                expect(aRebill.entity_type).to.be.equal('rebill');
            });
        });
    });

    describe('sendMessageAndMarkRebill', () => {
        after(() => {
            mockery.deregisterAll();
        });

        it('should resolve', () => {
            // given
            let rebill_datetime = TimestampUtils.getISO8601();
            let aRebill = { id: '668ad918-0d09-4116-a6fe-0e8a9eda36f7', created_at: rebill_datetime, updated_at: rebill_datetime};

            PermissionTestGenerators.givenUserWithAllowed('update', 'rebill');
            process.env.search_indexing_queue_url = 'url';

            // mock sqs utilities that always succeed
            mockery.registerMock(global.routes.path('lib', 'sqs-utilities.js'), {
                sendMessage: (parameters, callback) => {
                    callback(null, {});
                }

            });

            // mock dynamodb utilities that return a single rebill and save always succeeds
            mockery.registerMock(global.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, [aRebill]);
                },
                saveRecord: (table, entity, callback) => {
                    callback(null, entity);
                }
            });

            let rebillController = global.routes.include('controllers', 'entities/Rebill.js');

            // when
            return rebillController.sendMessageAndMarkRebill(aRebill).then(() => {
                // then
                expect(aRebill.processing).to.be.equal('true');
                expect(aRebill.entity_type).to.be.equal('rebill');
            });
        });

        it('should reject when sending message fails', () => {
            // given
            let aRebill = {};

            // mock sqs utilities that always fails
            mockery.registerMock(global.routes.path('lib', 'sqs-utilities.js'), {
                sendMessage: (parameters, callback) => {
                    callback(new Error('Sending message failed.'), null);
                }

            });

            let rebillController = global.routes.include('controllers', 'entities/Rebill.js');

            // when
            return rebillController.sendMessageAndMarkRebill(aRebill).catch((error) => {
                // then
                expect(aRebill.processing).not.to.be.equal('true');
                expect(error.message).to.be.equal('Sending message failed.');
            });
        });
    });

    describe('updateRebillTransactions', () => {
        after(() => {
            mockery.deregisterAll();
        });

        before(() => {
            PermissionTestGenerators.givenUserWithAllowed('create', 'rebill');
        });

        it('merges transactions', () => {
            // given
            let aRebill = {
                transactions: ['1', '2']
            };

            let rebillController = global.routes.include('controllers', 'entities/Rebill.js');

            // when
            return rebillController.updateRebillTransactions(aRebill, ['3', '4']).then((savedRebill) => {
                // then
                expect(aRebill.transactions).to.deep.equal(['1', '2', '3', '4']);
            });
        });

    });

    function givenAnySession() {
        return {
            "id": "668ad918-0d09-4116-a6fe-0e8a9eda36f7"
        }
    }

    function givenAnyProductSchedule() {
        return {
            schedule: [
                {
                    start: 1,
                    end: 30,
                    period: 1,
                    product_id: 42,
                    price: 100
                }
            ]
        }
    }

    function givenAnyDayInCycle() {
        return 2;
    }
});
