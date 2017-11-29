const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

function getValidSession(){

    return {
        completed: false,
        subaffiliate_5: '45f025bb-a9dc-45c7-86d8-d4b7a4443426',
        created_at: timestamp.getISO8601(),
        subaffiliate_2: '22524f47-9db7-42f9-9540-d34a8909b072',
        subaffiliate_1: '6b6331f6-7f84-437a-9ac6-093ba301e455',
        subaffiliate_4: 'd515c0df-f9e4-4a87-8fe8-c53dcace0995',
        subaffiliate_3: 'fd2548db-66a8-481e-aacc-b2b76a88fea7',
        product_schedules: [],
        updated_at: timestamp.getISO8601(),
        affiliate: '332611c7-8940-42b5-b097-c49a765e055a',
        account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
        customer: '24f7c851-29d4-4af9-87c5-0298fa74c689',
        campaign: '70a6689a-5814-438b-b9fd-dd484d0812f9',
        id: uuidV4(),
        cid: 'fb10d33f-da7d-4765-9b2b-4e5e42287726'
    };

}

describe('controllers/endpoints/transaction', () => {

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

    describe('initialize', () => {

        it('successfully initialize the transaction class without callback function', () => {
            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

            let transactionController = new TransactionController();

            expect(transactionController.initialize()).to.be.true;
        });

        it('successfully initialize the transaction class with callback function', () => {

            let a_function = () => {return 'result from function'}; //any function

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

            let transactionController = new TransactionController();

            expect(transactionController.initialize(a_function)).to.equal('result from function');
        });
    });

    describe('validateInput', () => {

        it('throws error if validation function is not a function', () => {

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

            let transactionController = new TransactionController();

            return transactionController.validateInput('an-event', 'not_a_function').catch(error =>
                expect(error.message).to.equal('[500] Validation function is not a function.'));
        });

        it('throws error if event input is undefined', () => {

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

            let transactionController = new TransactionController();

            return transactionController.validateInput(undefined, () => {}).catch(error =>
                expect(error.message).to.equal('[500] Undefined event input.'));
        });

        it('throws validation error', () => {

            let a_function_with_errors = () => {return {errors: ['an_error']}};

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

            let transactionController = new TransactionController();

            return transactionController.validateInput('an_event', a_function_with_errors).catch(error =>
                expect(error.message).to.equal('[500] One or more validation errors occurred.'));
        });

        it('validates input', () => {

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

            let transactionController = new TransactionController();

            return transactionController.validateInput('an_event', () => {}).then(result =>
                expect(result).to.equal('an_event'));
        });
    });

    describe('sendEmails', () => {

        it('sends email with appointed data', () => {

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

            let transactionController = new TransactionController();

            transactionController.userEmailHelperController = {
                sendEmail: (event, info) => {
                    return Promise.resolve(info);
                }
            };

            return transactionController.sendEmails('an-event', 'an_info').then(result =>
                expect(result).to.equal('an_info'));
        });

        it('throws error from email helper controller', () => {

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

            let transactionController = new TransactionController();

            transactionController.userEmailHelperController = {
                sendEmail: (event, info) => {
                    return Promise.reject(new Error('Sending failed'));
                }
            };

            return transactionController.sendEmails('an-event', 'an_info').then(result =>
                expect(result).to.equal('an_info'));
        });
    });

    describe('createEventObject', () => {

        it('creates event object', () => {

            let an_event = {
                affiliates: {any_affiliate: 'an_affiliate'},
                campaign: 'a_campaign'
            };

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

            let transactionController = new TransactionController();

            let result = transactionController.createEventObject(an_event, 'an_event_type');

            expect(result.type).to.equal('an_event_type');
            expect(result.campaign).to.equal(an_event.campaign);
        });
    });

    describe('validateCreditCard', () => {

        it('validates credit card', () => {

            //valid credit card number
            let params = {creditcard: {number: 4111111111111111}};

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

            let transactionController = new TransactionController();

            return transactionController.validateCreditCard(params).then(result =>
                expect(result).to.equal(params));
        });

        it('throws error when credit card number is not valid', () => {

            //invalid credit card number
            let params = {creditcard: {number: 123456}};

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

            let transactionController = new TransactionController();

            return transactionController.validateCreditCard(params).catch(error =>
                expect(error).to.equal('Invalid Credit Card number.'));
        });
    });

    describe('handleTracking', () => {

        it('successfully handles tracking', () => {

            let an_info = {session: {id: 'dummy-id'}};

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

            let transactionController = new TransactionController();

            transactionController.trackerHelperController = {
                handleTracking: function(id, info){
                    return Promise.resolve(info);
                }
            };

            return transactionController.handleTracking(an_info).then(result =>
                expect(result).to.equal(an_info));
        });
    });

    describe('issueNotifications', () => {

        let account_copy;

        beforeEach(() => {
            account_copy = global.account;
        });

        afterEach(() => {
            global.account = account_copy;
        });

        it('uses global account for issuing notifications', (done) => {

            let params = {account: 'an_account'};
            global.account = 'different_account';

            mockery.registerMock(global.SixCRM.routes.path('providers', 'notification/notification-provider'), {
                createNotificationsForAccount: (parameters) => {
                    expect(parameters.account).not.to.equal('an_account');
                    expect(parameters.account).to.equal(global.account);
                    done();
                }
            });

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

            let transactionController = new TransactionController();

            transactionController.issueNotifications(params);
        });
    });

    describe('pushRecordToRedshift', () => {

        it('successfully pushes a record to redshift', () => {

            let an_object = { a_property: 'a_value'};
            let table_name = 'a_name';
            mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
                putRecord: (table, object) => {
                    expect(table).to.deep.equal(table_name);
                    expect(object).to.deep.equal(an_object);

                    return Promise.resolve('success');
                }
            });

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

            let transactionController = new TransactionController();

            return transactionController.pushRecordToRedshift(table_name, an_object).then(result =>
                expect(result).to.equal('success'));
        });
    });

    describe('pushEventToRedshift', () => {

        it('successfully pushes an event to redshift', () => {

            let session = getValidSession();

            mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
                putRecord: (table, object) => {

                    expect(table).to.deep.equal('events');
                    expect(object.session).to.deep.equal(session.id);
                    expect(object.type).to.deep.equal('an_event_type');
                    expect(object.datetime).to.deep.equal(session.created_at);
                    expect(object.account).to.deep.equal(session.account);
                    expect(object.campaign).to.deep.equal(session.campaign);
                    expect(object.product_schedules).to.deep.equal(['a_product_schedule']);

                    return Promise.resolve('success');
                }
            });

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

            let transactionController = new TransactionController();

            return transactionController.pushEventToRedshift({
                event_type: 'an_event_type',
                session: session,
                product_schedules: ['a_product_schedule']
            }).then(result => expect(result).to.equal(session));
        });

        it('successfully pushes an event to redshift without product schedules', () => {

            let session = getValidSession();

            mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
                putRecord: (table, object) => {

                    expect(table).to.deep.equal('events');
                    expect(object.session).to.deep.equal(session.id);
                    expect(object.type).to.deep.equal('an_event_type');
                    expect(object.datetime).to.deep.equal(session.created_at);
                    expect(object.account).to.deep.equal(session.account);
                    expect(object.campaign).to.deep.equal(session.campaign);

                    return Promise.resolve('success');
                }
            });

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

            let transactionController = new TransactionController();

            return transactionController.pushEventToRedshift({
                event_type: 'an_event_type',
                session: session
            }).then(result => expect(result).to.equal(session));
        });
    });
});
