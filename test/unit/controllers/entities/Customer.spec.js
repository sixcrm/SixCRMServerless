let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

function getValidSession() {
    return {
        "id": "668ad918-0d09-4116-a6fe-0e8a9eda36f7",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "customer": "24f7c851-29d4-4af9-87c5-0298fa74c689",
        "campaign":"70a6689a-5814-438b-b9fd-dd484d0812f9",
        "product_schedules":[],
        "completed": false,
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z",
        "affiliate":	"332611c7-8940-42b5-b097-c49a765e055a",
        "subaffiliate_1":	"6b6331f6-7f84-437a-9ac6-093ba301e455",
        "subaffiliate_2":	"22524f47-9db7-42f9-9540-d34a8909b072",
        "subaffiliate_3":	"fd2548db-66a8-481e-aacc-b2b76a88fea7",
        "subaffiliate_4":	"d515c0df-f9e4-4a87-8fe8-c53dcace0995",
        "subaffiliate_5":	"45f025bb-a9dc-45c7-86d8-d4b7a4443426",
        "cid":"fb10d33f-da7d-4765-9b2b-4e5e42287726"
    }
}

function getValidCustomer() {
    return {
        "id":"24f7c851-29d4-4af9-87c5-0298fa74c689",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "email":"rama@damunaste.org",
        "firstname":"Rama",
        "lastname":"Damunaste",
        "phone":"1234567890",
        "address":{
            "line1":"10 Downing St.",
            "city":"London",
            "state":"OR",
            "zip":"97213",
            "country":"US"
        },
        "creditcards":["df84f7bb-06bd-4daa-b1a3-6a2c113edd72"],
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }
}

function getValidCreditCards() {
    return [{
        "id": "df84f7bb-06bd-4daa-b1a3-6a2c113edd72",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "address": {
            "city": "Portland",
            "country": "US",
            "line1": "10 Skid Rw.",
            "line2": "Suite 100",
            "state": "OR",
            "zip": "97213"
        },
        "number": "4111111111111111",
        "ccv": "999",
        "expiration": "1025",
        "name": "Rama Damunaste",
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }]
}

describe('controllers/entities/Customer.js', () => {

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

    describe('listCustomerSessions', () => {

        it('returns session list by customer', () => {

            let params = {customer: getValidCustomer(), pagination: 0};

            let session = getValidSession();

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), {
                listByCustomer: ({customer, pagination}) => {
                    expect(customer).to.equal(params.customer);
                    expect(pagination).to.equal(params.pagination);

                    return Promise.resolve({ Items: [{ session: session }]});
                }
            });

            let customerController = global.SixCRM.routes.include('controllers','entities/Customer');

            return customerController.listCustomerSessions(params).then((result) => {
                expect(result.Items[0].session).to.deep.equal(session);
            });
        });
    });

    describe('getCustomerSessions', () => {

        it('retrieves customer sessions', () => {
            let customer = getValidCustomer();

            let session = getValidSession();

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), {
                getSessionByCustomer: (a_customer) => {
                    expect(a_customer).to.equal(customer.id);
                    return Promise.resolve([{session: session}]);
                }
            });

            let customerController = global.SixCRM.routes.include('controllers','entities/Customer');

            return customerController.getCustomerSessions(customer).then((result) => {
                expect(result[0].session).to.deep.equal(session);
            });
        });
    });

    describe('getAddress', () => {

        it('successfully retrieves customer\'s address', () => {

            let customer = getValidCustomer();

            let customerController = global.SixCRM.routes.include('controllers','entities/Customer');

            return customerController.getAddress(customer).then((result) => {
                expect(result).to.equal(customer.address);
            });
        });
    });

    describe('getFullName', () => {

        it('successfully retrieves customer\'s full name', () => {

            let customer = getValidCustomer();

            let customerController = global.SixCRM.routes.include('controllers','entities/Customer');

            expect(customerController.getFullName(customer))
                .to.equal(customer.firstname + ' ' + customer.lastname);
        });

        it('successfully retrieves customer\'s first name', () => {

            let customer = getValidCustomer();

            delete customer.lastname;

            let customerController = global.SixCRM.routes.include('controllers','entities/Customer');

            expect(customerController.getFullName(customer))
                .to.equal(customer.firstname);
        });

        it('successfully retrieves customer\'s last name', () => {

            let customer = getValidCustomer();

            delete customer.firstname;

            let customerController = global.SixCRM.routes.include('controllers','entities/Customer');

            expect(customerController.getFullName(customer))
                .to.equal(customer.lastname);
        });

        it('returns empty string when customer\'s name is undefined', () => {

            let customer = getValidCustomer();

            delete customer.firstname;
            delete customer.lastname;

            let customerController = global.SixCRM.routes.include('controllers','entities/Customer');

            expect(customerController.getFullName(customer))
                .to.equal('');
        });
    });

    describe('getCustomerByEmail', () => {

        it('successfully retrieves customer by email', () => {

            let customer = getValidCustomer();

            let mock_entity = class {
                constructor(){}

                getBySecondaryIndex({field, index_value, index_name}) {
                    expect(field).to.equal('email');
                    expect(index_value).to.equal(customer.email);
                    expect(index_name).to.equal('email-index');
                    return Promise.resolve(customer);
                }
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Entity.js'), mock_entity);

            let customerController = global.SixCRM.routes.include('controllers','entities/Customer');

            return customerController.getCustomerByEmail(customer.email).then((result) => {
                expect(result).to.equal(customer);
            });
        });
    });

    describe('getCreditCards', () => {

        it('successfully retrieves credit cards', () => {

            let customer = getValidCustomer();

            let credit_cards = getValidCreditCards();

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
                    return Promise.resolve({
                        Count: 2,
                        Items: [{}, {}]
                    });
                },
                createINQueryParameters: (field, list_array) => {
                    expect(field).to.equal('id');
                    expect(list_array[0]).to.equal(customer.creditcards[0]);
                    return Promise.resolve({
                        filter_expression: 'a_filter',
                        expression_attribute_values: 'an_expression_values'
                    })
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers','entities/CreditCard.js'), {
                listByAccount: (query_parameters) => {
                    return Promise.resolve({creditcards: credit_cards});
                }
            });

            let customerController = global.SixCRM.routes.include('controllers','entities/Customer');

            return customerController.getCreditCards(customer).then((result) => {
                expect(result).to.equal(credit_cards);
            });
        });

        it('returns null when customer has no credit cards', () => {

            let customer = getValidCustomer();

            delete customer.creditcards;

            let customerController = global.SixCRM.routes.include('controllers','entities/Customer');

            return customerController.getCreditCards(customer).then((result) => {
                expect(result).to.equal(null);
            });
        });
    });
});