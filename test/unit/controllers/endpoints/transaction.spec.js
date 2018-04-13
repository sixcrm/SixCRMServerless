const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

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

      xit('successfully initialize the transaction class with callback function', () => {

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

    describe('pushEvent', () => {

        it('successfully pushes event under minimum conditions', () => {

            let context = {
                event_type: 'test'
            };

            mockery.registerMock(global.SixCRM.routes.path('helpers','events/Event.js'), class {
                constructor(){}
                pushEvent({event_type, context}){
                    expect(event_type).to.equal(context.event_type);
                    expect(stringutilities.isUUID(context.id)).to.be.true;
                    expect(context.user).to.equal(global.user);
                    return Promise.resolve({});
                }
            });

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
            let transactionController = new TransactionController();

            transactionController.event_type = context.event_type;

            transactionController.pushEvent({context: context});
        });

        it('successfully pushes event when event helper controller is already set', () => {

            let context = {
                event_type: 'test'
            };

            mockery.registerMock(global.SixCRM.routes.path('helpers','events/Event.js'), class {
                constructor(){}
                pushEvent({event_type, context}){
                    expect(event_type).to.equal(context.event_type);
                    expect(stringutilities.isUUID(context.id)).to.be.true;
                    expect(context.user).to.equal(global.user);
                    return Promise.resolve({});
                }
            });

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
            let transactionController = new TransactionController();

            const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
            transactionController.eventHelperController = new EventHelperController();
            transactionController.event_type = context.event_type;

            transactionController.pushEvent({context: context});
        });

        it('successfully pushes event when event type is not specified but is present in the context', () => {

            let context = {
                event_type: 'test'
            };

            mockery.registerMock(global.SixCRM.routes.path('helpers','events/Event.js'), class {
                constructor(){}
                pushEvent({event_type, context}){
                    expect(event_type).to.equal(context.event_type);
                    expect(stringutilities.isUUID(context.id)).to.be.true;
                    expect(context.user).to.equal(global.user);
                    return Promise.resolve({});
                }
            });

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
            let transactionController = new TransactionController();

            transactionController.pushEvent({context: context});
        });

        it('successfully pushes event when context is defined in store', () => {

            let context = {
                event_type: 'test'
            };

            mockery.registerMock(global.SixCRM.routes.path('helpers','events/Event.js'), class {
                constructor(){}
                pushEvent({event_type, context}){
                    expect(event_type).to.equal(context.event_type);
                    expect(stringutilities.isUUID(context.id)).to.be.true;
                    expect(context.user).to.equal(global.user);
                    return Promise.resolve({});
                }
            });

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
            let transactionController = new TransactionController();

            transactionController.initialize();
            transactionController.parameters.store = context;
            transactionController.event_type = context.event_type;

            transactionController.pushEvent();
        });

        it('throws an error when event_type is not set', () => {

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
            let transactionController = new TransactionController();

            try{
                transactionController.pushEvent({});
            }catch(error){
                expect(error.message).to.equal('[500] Unable to identify event_type.');
            }

        });

        it('throws an error when context is not set', () => {

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
            let transactionController = new TransactionController();

            try{
                transactionController.pushEvent({event_type: 'test'});
            }catch(error){
                expect(error.message).to.equal('[500] Unset context.');
            }

        });

    });

    describe('postProcessing', () => {

        it('returns true when post processing was successful', () => {

            let context = {
                event_type: 'test'
            };

            mockery.registerMock(global.SixCRM.routes.path('helpers','events/Event.js'), class {
                constructor(){}
                pushEvent({event_type, context}){
                    expect(event_type).to.equal(context.event_type);
                    expect(stringutilities.isUUID(context.id)).to.be.true;
                    expect(context.user).to.equal(global.user);
                    return Promise.resolve({});
                }
            });

            const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
            let transactionController = new TransactionController();

            transactionController.initialize();
            transactionController.parameters.store = context;
            transactionController.event_type = context.event_type;

            transactionController.postProcessing(context.event_type);
        });
    });

});
