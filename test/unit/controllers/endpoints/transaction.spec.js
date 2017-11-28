const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

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
            let transactionController = new TransactionController();

            expect(transactionController.initialize()).to.be.true;
        });

        it('successfully initialize the transaction class with callback function', () => {

            let a_function = () => {return 'result from function'}; //any function
            let transactionController = new TransactionController();

            expect(transactionController.initialize(a_function)).to.equal('result from function');
        });
    });

    describe('validateInput', () => {

        it('throws error if validation function is not a function', () => {

            let transactionController = new TransactionController();

            return transactionController.validateInput('an-event', 'not_a_function').catch(error =>
                expect(error.message).to.equal('[500] Validation function is not a function.'));
        });

        it('throws error if event input is undefined', () => {

            let transactionController = new TransactionController();

            return transactionController.validateInput(undefined, () => {}).catch(error =>
                expect(error.message).to.equal('[500] Undefined event input.'));
        });

        it('throws validation error', () => {

            let a_function_with_errors = () => {return {errors: ['an_error']}};

            let transactionController = new TransactionController();

            return transactionController.validateInput('an_event', a_function_with_errors).catch(error =>
                expect(error.message).to.equal('[500] One or more validation errors occurred.'));
        });

        it('validates input', () => {

            let transactionController = new TransactionController();

            return transactionController.validateInput('an_event', () => {}).then(result =>
                expect(result).to.equal('an_event'));
        });
    });

    describe('sendEmails', () => {

        it('sends email with appointed data', () => {

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

            let transactionController = new TransactionController();

            let result = transactionController.createEventObject(an_event, 'an_event_type');

            expect(result.type).to.equal('an_event_type');
            expect(result.campaign).to.equal(an_event.campaign);
        });
    });
});
