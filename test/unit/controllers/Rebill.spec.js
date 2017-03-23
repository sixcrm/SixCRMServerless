const PermissionTestGenerators = require('../lib/permission-test-generators');
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
            rebillController = require('../../../controllers/Rebill');
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
            expect(rebill.billdate).to.equal((aProductSchedule.schedule[0].period * oneDayInSeconds) + nowInSeconds());
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
            expect(rebill.billdate).to.equal((aProductSchedule.schedule[0].period * oneDayInSeconds) + nowInSeconds());
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
            expect(rebill.billdate).to.equal((aProductSchedule.schedule[2].period * oneDayInSeconds) + nowInSeconds());
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
            let rebillController = require('../../../controllers/Rebill');

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
            let rebillController = require('../../../controllers/Rebill');

            // when
            return rebillController.createRebill(aSession, aProductSchedule, aDayInCycle).then((rebill) => {
                // then
                expect(rebill).to.be.null;
            });
        });

        it('creates a rebill with a date in the future', () => {
            // given
            PermissionTestGenerators.givenUserWithAllowed('create','rebill');
            let aSession = givenAnySession();
            let aProductSchedule = givenAnyProductSchedule();
            let aDayInCycle = givenAnyDayInCycle();

            mockery.registerMock('../lib/dynamodb-utilities.js', {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, []);
                },
                saveRecord: (table, entity, callback) => {
                    callback(null, entity);
                }
            });
            mockery.registerMock('../lib/indexing-utilities.js', {
                addToSearchIndex: (entity, entity_type) => {
                    return new Promise((resolve) => {
                        resolve(true);
                    });
                }
            });

            let rebillController = require('../../../controllers/Rebill');

            // when
            return rebillController.createRebill(aSession, aProductSchedule, aDayInCycle).then((rebill) => {
                expect(rebill.id).to.have.lengthOf(36);
                expect(rebill.billdate).to.equal(nowInSeconds() + aProductSchedule.schedule[0].period * oneDayInSeconds);
            });
        });
    });

    describe('buildRebillObject', () => {
        it('returns an object with correct parameters', () => {
            // given
            let parameters = {
                billdate: Date.now(),
                parentsession: '1',
                product_schedules: [],
                amount: 100
            };


            let rebillController = require('../../../controllers/Rebill');

            // when
            let rebillObject = rebillController.buildRebillObject(parameters);

            // then
            expect(rebillObject.id).to.have.lengthOf(36); // UUIDv4 is 36 characters long
            expect(rebillObject.billdate).to.equal(parameters.billdate);
            expect(rebillObject.parentsession).to.equal(parameters.parentsession);
            expect(rebillObject.product_schedules).to.equal(parameters.product_schedules);
            expect(rebillObject.amount).to.equal(parameters.amount);
        });
    });

    describe('should calculate day in cycle', () => {
        let rebillController;

        before(() => {
            rebillController = require('../../../controllers/Rebill');
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
            let aRebill = {};

            process.env.bill_queue_url = 'tesbill';
            process.env.bill_failed_queue_url = 'testfailbill';
            process.env.hold_queue_url = 'testhold';
            process.env.search_indexing_queue_url = 'url';

            // mock sqs utilities that always succeed
            mockery.registerMock('../lib/sqs-utilities.js', {
                sendMessage: (parameters, callback) => {
                    callback(null, {});
                    expect(parameters.queue_url).to.equal(process.env.bill_queue_url); // expect queue url to be correct
                }

            });

            // mock permission utilities that always allow the action
            mockery.registerMock('../lib/permission-utilities.js', {
                validatePermissions: (action, entity) => {
                    return new Promise((resolve) => resolve(true));
                }

            });

            // mock dynamodb utilities that return a single rebill and save always succeeds
            mockery.registerMock('../lib/dynamodb-utilities.js', {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, [aRebill]);
                },
                saveRecord: (table, entity, callback) => {
                    callback(null, entity);
                }
            });

            let rebillController = require('../../../controllers/Rebill');

            // when
            return rebillController.addRebillToQueue(aRebill, 'bill').then(() => {
                // then
                expect(aRebill.processing).to.be.equal('true');
                expect(aRebill.entity_type).to.be.equal('rebill');
            });
        });
    });

    describe('sendMessageAndMarkRebill', () => {
        it('should resolve', () => {
            // given
            let aRebill = {};

            // mock sqs utilities that always succeed
            mockery.registerMock('../lib/sqs-utilities.js', {
                sendMessage: (parameters, callback) => {
                    callback(null, {});
                }

            });

            // mock dynamodb utilities that return a single rebill and save always succeeds
            mockery.registerMock('../lib/dynamodb-utilities.js', {
                queryRecords: (table, parameters, index, callback) => {
                    callback(null, [aRebill]);
                },
                saveRecord: (table, entity, callback) => {
                    callback(null, entity);
                }
            });

            let rebillController = require('../../../controllers/Rebill');

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
            mockery.registerMock('../lib/sqs-utilities.js', {
                sendMessage: (parameters, callback) => {
                    callback(new Error('Sending message failed.'), null);
                }

            });

            let rebillController = require('../../../controllers/Rebill');

            // when
            return rebillController.sendMessageAndMarkRebill(aRebill).catch((error) => {
                // then
                expect(aRebill.processing).not.to.be.equal('true');
                expect(error.message).to.be.equal('Sending message failed.');
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
