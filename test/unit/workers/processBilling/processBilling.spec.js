const fs = require('fs');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const modelgenerator = global.SixCRM.routes.include('test', 'model-generator.js');

require('../../../bootstrap.test');

function getValidSessions(){
    return [
            {
                id: 'f2e86423-ee62-48d3-ad6a-a138529383d6',
                customer: '9dbFE21A-35Ed-453b-96E2-747EeD05F917',
                campaign: '5DeE9787-10cc-4CEA-ABcc-CffEe48fBFBb',
                account: '*',
                created_at: '7560-99-48T42:79:21',
                updated_at: '3049-56-28T29:38:80_667'
            },
            {
                id: 'f2e86423-ee62-48d3-ad6a-a138529383d6',
                customer: '9dbFE21A-35Ed-453b-96E2-747EeD05F917',
                campaign: '5DeE9787-10cc-4CEA-ABcc-CffEe48fBFBb',
                account: '*',
                created_at: '7560-99-48T42:79:21',
                updated_at: '3049-56-28T29:38:80_667'
            }
        ];
}

function getValidCustomer(){

    return {
        id:"24f7c851-29d4-4af9-87c5-0298fa74c689",
        account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        email:"rama@damunaste.org",
        firstname:"Rama",
        lastname:"Damunaste",
        phone:"1234567890",
        address:{
            line1:"10 Downing St.",
            city:"London",
            state:"Oregon",
            zip:"97213",
            country:"US"
        },
        creditcards:["df84f7bb-06bd-4daa-b1a3-6a2c113edd72"],
        created_at:"2017-04-06T18:40:41.405Z",
        updated_at:"2017-04-06T18:41:12.521Z"
    };

}

function getValidCreditCard() {
    return {
        "id": "df84f7bb-06bd-4daa-b1a3-6a2c113edd72",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "address": {
            "city": "Portland",
            "country": "USA",
            "line1": "10 Skid Rw.",
            "line2": "Suite 100",
            "state": "Oregon",
            "zip": "97213"
        },
        "number": "4111111111111111",
        "ccv": "999",
        "expiration": "1025",
        "name": "Rama Damunaste",
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }

}

function getValidDate() {
    return Date.now();
}

describe('controllers/workers/processBilling', function () {
    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    let random_rebill;
    let random_transactions;
    let random_transaction_products;
    let random_products;
    let random_product_schedules;

    beforeEach((done) => { Promise.all([
        modelgenerator.randomEntityWithId('rebill').then(rebill => { random_rebill = rebill}),
        modelgenerator.randomEntityWithId('transaction').then(transaction => { random_transactions = [transaction]}),
        modelgenerator.randomEntityWithId('transactionproduct').then(transaction_product => { random_transaction_products = [transaction_product, transaction_product]}),
        modelgenerator.randomEntityWithId('product').then(product => { random_products = [product, product]}),
        modelgenerator.randomEntityWithId('productschedule').then(productschedule => { random_product_schedules = [productschedule, productschedule]})
    ]).then(() =>{
        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), {
            putTransaction: ({session, rebill, amount, product}, processor_result) => {
                return Promise.resolve(random_transactions[0]);
            }
        });
        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/ProductSchedule.js'), {
            getTransactionProducts: (aDayInCycle, productschedules) => {
                return random_transaction_products;
            }
        });
        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/CreditCard.js'), {
            get: (session) => {
                return Promise.resolve(getValidCreditCard());
            }
        });
        done();
        }
    )});

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

    describe('validateRebillForProcessing', () => {

        it('returns error when current date is before billing date', () => {

            const currentDate = getValidDate();

            mockery.registerMock(global.SixCRM.routes.path('lib', 'timestamp.js'), {
                dateToTimestamp: () => {
                    return Promise.resolve(currentDate);
                },
                getTimeDifference: () => {
                    return -12345;
                }
            });

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.validateRebillForProcessing(random_rebill)
                .catch(error => expect(error.message).to.equal('[400] Rebill is not eligible for processing at this time.'));
        });

        it('returns error when rebill has been attempted three times', () => {

            const currentDate = getValidDate();

            mockery.registerMock(global.SixCRM.routes.path('lib', 'timestamp.js'), {
                dateToTimestamp: () => {
                    return Promise.resolve(currentDate);
                },
                getTimeDifference: () => {
                    return 12345;
                }
            });

            random_rebill.second_attempt = currentDate/1000;

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.validateRebillForProcessing(random_rebill)
                .catch(error => expect(error.message).to.equal('[400] The rebill has already been attempted three times.'));
        });

        it('returns error when rebill\'s first attempt was too recent', () => {

            const currentDate = getValidDate();

            mockery.registerMock(global.SixCRM.routes.path('lib', 'timestamp.js'), {
                dateToTimestamp: () => {
                    return Promise.resolve(currentDate);
                },
                getTimeDifference: () => {
                    return 12345;
                }
            });

            random_rebill.first_attempt = currentDate/1000;

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.validateRebillForProcessing(random_rebill)
                .catch(error => expect(error.message).to.equal('[400] Rebill\'s first attempt is too recent.'));
        });

        it('returns error when rebill is not associated with any product schedule', () => {

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                listTransactions: (rebill) => {
                    return Promise.resolve(random_transactions);
                },
                getProductSchedules: (rebill) => {
                    return Promise.resolve(random_product_schedules);
                },
                getParentSession: (rebill) => {
                    return Promise.resolve(random_rebill.parentsession);
                }
            });

            random_product_schedules = [];
            random_rebill.bill_at = getValidDate();

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.validateRebillForProcessing(random_rebill)
                .catch(error => expect(error.message).to.equal('[404] A Rebill must be associated with atleast one product schedule.'));
        });

        it('returns error if retrieved session is invalid', () => {

            let validation_errors = {errors: ["invalidSessionError"]};

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                listTransactions: (rebill) => {
                    return Promise.resolve(random_transactions);
                },
                getProductSchedules: (rebill) => {
                    return Promise.resolve(random_product_schedules);
                },
                getParentSession: (rebill) => {
                    return Promise.resolve(random_rebill.parentsession);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), {
                validate: () => {
                    return Promise.resolve(validation_errors);
                }
            });

            random_rebill.bill_at = getValidDate();

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.validateRebillForProcessing(random_rebill)
                .catch(error => expect(error.message).to.equal('[404] Invalid Session returned.'));
        });

        it('returns error if number of days in cycle is invalid', () => {

            let validation_errors = {errors: []};

            let aDayInCycle = -1;

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                listTransactions: (rebill) => {
                    return Promise.resolve(random_transactions);
                },
                getProductSchedules: (rebill) => {
                    return Promise.resolve(random_product_schedules);
                },
                getParentSession: (rebill) => {
                    return Promise.resolve(random_rebill.parentsession);
                },
                calculateDayInCycle: () => {
                    return aDayInCycle;
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), {
                validate: () => {
                    return Promise.resolve(validation_errors);
                }
            });

            random_rebill.bill_at = getValidDate();

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.validateRebillForProcessing(random_rebill)
                .catch(error => expect(error.message).to.equal('[500] Invalid day in cycle returned for session.'));
        });

        it('returns error if transaction product doesn\'t have an amount', () => {

            let validation_errors = {errors: []};

            let aDayInCycle = 2;

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                listTransactions: (rebill) => {
                    return Promise.resolve(random_transactions);
                },
                getProductSchedules: (rebill) => {
                    return Promise.resolve(random_product_schedules);
                },
                getParentSession: (rebill) => {
                    return Promise.resolve(random_rebill.parentsession);
                },
                calculateDayInCycle: () => {
                    return aDayInCycle;
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), {
                validate: () => {
                    return Promise.resolve(validation_errors);
                }
            });

            random_rebill.bill_at = getValidDate();

            random_transaction_products.forEach(random_transaction_product => {
                delete random_transaction_product.amount;
            });

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.validateRebillForProcessing(random_rebill)
                .catch(error => expect(error.message).to.equal('[500] Transaction product missing an amount: ' + random_products[0]));
        });

        it('returns error if transaction product is missing a product', () => {

            let validation_errors = {errors: []};

            let aDayInCycle = 2;

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                listTransactions: (rebill) => {
                    return Promise.resolve(random_transactions);
                },
                getProductSchedules: (rebill) => {
                    return Promise.resolve(random_product_schedules);
                },
                getParentSession: (rebill) => {
                    return Promise.resolve(random_rebill.parentsession);
                },
                calculateDayInCycle: () => {
                    return aDayInCycle;
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), {
                validate: () => {
                    return Promise.resolve(validation_errors);
                }
            });

            random_rebill.bill_at = getValidDate();

            random_transaction_products.forEach(random_transaction_product => {
                delete random_transaction_product.product;
            });

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.validateRebillForProcessing(random_rebill)
                .catch(error => expect(error.message).to.equal('[500] Transaction product missing a product: ' + random_products[0]));
        });

        it('returns error if incorrect product is associated with product schedule', () => {

            let validation_errors = {errors: []};

            let product_validation_errors = {errors: ["invalidProductError"]};

            let aDayInCycle = 2;

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                listTransactions: (rebill) => {
                    return Promise.resolve(random_transactions);
                },
                getProductSchedules: (rebill) => {
                    return Promise.resolve(random_product_schedules);
                },
                getParentSession: (rebill) => {
                    return Promise.resolve(random_rebill.parentsession);
                },
                calculateDayInCycle: () => {
                    return aDayInCycle;
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), {
                validate: () => {
                    return Promise.resolve(validation_errors);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Product.js'), {
                get: (id) => {
                    return random_transaction_products[0];
                },
                validate: (product) => {
                    return product_validation_errors;
                }
            });

            random_rebill.bill_at = getValidDate();

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.validateRebillForProcessing(random_rebill)
                .catch(error => expect(error.message).to.equal('[500] Invalid product associated with product schedule.'));
        });

        it('successfully validates rebill for processing', () => {
            let validation_errors = {errors: []};

            let aDayInCycle = 2;

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                listTransactions: (rebill) => {
                    return Promise.resolve(random_transactions);
                },
                getProductSchedules: (rebill) => {
                    return Promise.resolve(random_product_schedules);
                },
                getParentSession: (rebill) => {
                    return Promise.resolve(random_rebill.parentsession);
                },
                calculateDayInCycle: () => {
                    return aDayInCycle;
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), {
                validate: () => {
                    return Promise.resolve(validation_errors);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Product.js'), {
                get: (id) => {
                    return random_transaction_products[0];
                },
                validate: (product) => {
                    return validation_errors;
                }
            });

            random_rebill.bill_at = getValidDate();

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.validateRebillForProcessing(random_rebill)
                .then(result => expect(result).to.equal(true));
        });
    });

    describe('getRebillProducts', () => {

        it('returns transaction products in order to rebill them according to their schedule', () => {

            let aDayInCycle = 2;

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                getProductSchedules: (rebill) => {
                    return Promise.resolve(random_product_schedules);
                },
                getParentSession: (rebill) => {
                    return Promise.resolve(random_rebill.parentsession);
                },
                calculateDayInCycle: () => {
                    return aDayInCycle;
                }
            });

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.getRebillProducts(random_rebill)
                .then(result => expect(result).to.equal(random_transaction_products));
        });

    });

    describe('processTransaction', () => {
        it('returns success message when transaction has been processed', () => {

            let sessions = getValidSessions();

            let processor_response = {
                    code: 'success',
                    result: {
                        message: "Success"
                    },
                    message: 'Success'
                };

            sessions[0].customer = getValidCustomer();  //hydrate session

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), {
                getSessionHydrated: (id) => {
                    return Promise.resolve(sessions[0]);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/LoadBalancer.js'), {
                process: () => {
                    return Promise.resolve(processor_response);
                }
            });

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.processTransaction(random_rebill, random_transaction_products)
                .then(response => expect(response.result.message).to.equal('Success'));
        });
    });

    describe('createTransaction', () => {

        it('creates transaction that has been successfully processed', () => {

            let sessions = getValidSessions();

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), {
                get: (id) => {
                    return Promise.resolve(sessions[0]);
                }
            });

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.createTransaction(random_rebill, random_products, random_transactions[0].processor_result)
                .then(result => expect(result).to.equal(random_transactions[0]));
        });
    });

    describe('evaluateTransactionResponse', () => {

        it('returns `BILLED` if transaction has been completed', () => {

            random_transactions[0].processor_response = {
                message: 'Success',
                result: {
                    response: '1',
                    responsetext: 'This is ok'
                }
            };

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.evaluateTransactionResponse(random_transactions[0].processor_response)
                .then(result => expect(result).to.equal(processBilling.messages.success));
        });

        it('returns `FAILED` if transaction hasn\'t been completed', () => {

            random_transactions[0].processor_response = {
                message: 'Error',
                result: {
                    response: '2',
                    responsetext: 'This is wrong'
                }
            };

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.evaluateTransactionResponse(random_transactions[0].processor_response)
                .then(result => expect(result).to.equal(processBilling.messages.failed));
        });
    });

    describe('markRebill', () => {

        it('returns true after first billing attempt', () => {

            const now = 1487768599196;

            const currentDate = getValidDate();

            mockery.registerMock(global.SixCRM.routes.path('lib', 'timestamp.js'), {
                createTimestampSeconds: () => {
                    return Promise.resolve(currentDate/1000);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                get: (id) => {
                    return Promise.resolve(random_rebill);
                },
                update: (rebill) => {
                    return Promise.resolve(random_rebill);
                }
            });

            random_rebill.first_attempt = now;

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.markRebill(random_rebill)
                .then(result => expect(result).to.equal(true));
        });

        it('returns true after second billing attempt', () => {

            const currentDate = getValidDate();

            mockery.registerMock(global.SixCRM.routes.path('lib', 'timestamp.js'), {
                createTimestampSeconds: () => {
                    return Promise.resolve(currentDate/1000);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                get: (id) => {
                    return Promise.resolve(random_rebill);
                },
                update: (entity) => {
                    return Promise.resolve(random_rebill);
                }
            });

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.markRebill(random_rebill)
                .then(result => expect(result).to.equal(true));
        });

    });

    describe('processBilling', () => {

        let processor_response;

        const currentDate = getValidDate();

        let validation_errors = {errors: []};

        let aDayInCycle = 2;

        let sessions = getValidSessions();

        beforeEach(() => {
            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
                listTransactions: (rebill) => {
                    return Promise.resolve(random_transactions);
                },
                getProductSchedules: (rebill) => {
                    return Promise.resolve(random_product_schedules);
                },
                getParentSession: (rebill) => {
                    return Promise.resolve(random_rebill.parentsession);
                },
                calculateDayInCycle: () => {
                    return aDayInCycle;
                },
                get: (id) => {
                    return Promise.resolve(random_rebill);
                },
                update: (rebill) => {
                    return Promise.resolve(random_rebill);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), {
                validate: () => {
                    return Promise.resolve(validation_errors);
                },
                getSessionHydrated: (id) => {
                    return Promise.resolve(sessions[0]);
                },
                get: (id) => {
                    return Promise.resolve(sessions[0]);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Product.js'), {
                get: (id) => {
                    return random_transaction_products[0];
                },
                validate: (product) => {
                    return validation_errors;
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/LoadBalancer.js'), {
                process: () => {
                    return Promise.resolve(processor_response);
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('lib', 'timestamp.js'), {
                createTimestampSeconds: () => {
                    return Promise.resolve(currentDate/1000); // any timestamp
                },
                dateToTimestamp: () => {
                    return Promise.resolve(currentDate);
                },
                getTimeDifference: () => {
                    return 12345; // any positive difference
                }
            });
        });

        it('returns `failed` if billing process has not been successful', () => {


            processor_response = {
                code: 'error',
                result: {
                    message: "Something wrong happened."
                },
                message: 'Error'
            };

            random_rebill.bill_at = getValidDate();

            sessions[0].customer = getValidCustomer();  //hydrate session

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.processBilling(random_rebill)
                .then(result => expect(result).to.equal(processBilling.messages.failed));
        });

        it('returns unchanged response from transaction evaluation if billing process has been successful', () => {

            processor_response = {
                code: 'success',
                result: {
                    message: "Success"
                },
                message: 'Success'
            };

            random_rebill.bill_at = getValidDate();

            sessions[0].customer = getValidCustomer();  //hydrate session

            const processBilling = global.SixCRM.routes.include('controllers', 'workers/processBilling.js');

            return processBilling.processBilling(random_rebill)
                .then(result => expect(result).to.equal(processBilling.messages.success));
        });
    });
});