let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidSession() {
    return MockEntities.getValidSession()
}

function getValidCustomer() {
    return MockEntities.getValidCustomer()
}

function getValidCreditCards() {
    return [MockEntities.getValidCreditCard()]
}

function getValidCustomerNotes() {
    return [MockEntities.getValidCustomerNotes()]
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

    describe('listByCreditCard', () => {

        it('lists customers by credit card', () => {
            let customer = getValidCustomer();

            PermissionTestGenerators.givenUserWithAllowed('read', 'customer');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters) => {
                    expect(table).to.equal('customers');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':id']).to.equal(customer.creditcards[0]);
                    return Promise.resolve({
                        Count: 1,
                        Items: [customer]
                    });
                }
            });

            let customerController = global.SixCRM.routes.include('controllers','entities/Customer');

            return customerController.listByCreditCard({
                creditcard: customer.creditcards[0], pagination: 0
            }).then((result) => {
                expect(result).to.deep.equal({
                    customers: [customer],
                    pagination: {
                        count: 1,
                        end_cursor: "",
                        has_next_page: "false",
                        last_evaluated: ""
                    }
                });
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
                queryRecords: (table, parameters) => {
                    expect(table).to.equal('customers');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':id']).to.equal(customer.creditcards[0]);
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
                listByAccount: () => {
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

    describe('getMostRecentCreditCard', () => {

        it('successfully retrieves most recent credit cards', () => {

            let customer = getValidCustomer();

            let credit_cards = getValidCreditCards();

            credit_cards[1] = {
                updated_at:"2017-12-25T10:21:12.521Z"
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'customer');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters) => {
                    expect(table).to.equal('customers');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(customer.id);
                    return Promise.resolve({
                        Count: 1,
                        Items: [customer]
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
                listByAccount: () => {
                    return Promise.resolve({creditcards: credit_cards});
                }
            });

            let customerController = global.SixCRM.routes.include('controllers','entities/Customer');

            return customerController.getMostRecentCreditCard(customer).then((result) => {
                expect(result).to.equal(credit_cards[0]);
            });
        });

        it('returns first in line credit card when two or more credit cards have the same update date', () => {

            let customer = getValidCustomer();

            let credit_cards = getValidCreditCards();

            credit_cards[1] = {
                updated_at: credit_cards[0].updated_at
            };

            PermissionTestGenerators.givenUserWithAllowed('read', 'customer');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters) => {
                    expect(table).to.equal('customers');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(customer.id);
                    return Promise.resolve({
                        Count: 1,
                        Items: [customer]
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
                listByAccount: () => {
                    return Promise.resolve({creditcards: credit_cards});
                }
            });

            let customerController = global.SixCRM.routes.include('controllers','entities/Customer');

            return customerController.getMostRecentCreditCard(customer).then((result) => {
                expect(result).to.equal(credit_cards[0]);
            });
        });

        it('returns null when customer data is empty', () => {

            let customer = getValidCustomer();

            PermissionTestGenerators.givenUserWithAllowed('read', 'customer');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters) => {
                    expect(table).to.equal('customers');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(customer.id);
                    return Promise.resolve({
                        Count: 0,
                        Items: [{}]
                    });
                }
            });

            let customerController = global.SixCRM.routes.include('controllers','entities/Customer');

            return customerController.getMostRecentCreditCard(customer).then((result) => {
                expect(result).to.equal(null);
            });
        });

        it('returns null when customer data is null', () => {

            let customer = getValidCustomer();

            PermissionTestGenerators.givenUserWithAllowed('read', 'customer');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters) => {
                    expect(table).to.equal('customers');
                    expect(parameters).to.have.property('key_condition_expression');
                    expect(parameters).to.have.property('filter_expression');
                    expect(parameters).to.have.property('expression_attribute_values');
                    expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(customer.id);
                    return Promise.resolve({
                        Count: 0,
                        Items: [null]
                    });
                }
            });

            let customerController = global.SixCRM.routes.include('controllers','entities/Customer');

            return customerController.getMostRecentCreditCard(customer).then((result) => {
                expect(result).to.equal(null);
            });
        });
    });

    describe('associatedEntitiesCheck', () => {

        it('checks associated entities', () => {

            let session = getValidSession();

            let customer_notes = getValidCustomerNotes();

            let params = {customer: getValidCustomer(), pagination: 0};

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), {
                listByCustomer: ({customer}) => {
                    expect(customer).to.equal(params.customer.id);
                    return Promise.resolve({ sessions: [session] });
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/CustomerNote.js'), {
                listByCustomer: ({customer}) => {
                    expect(customer).to.equal(params.customer.id);
                    return Promise.resolve({ customernotes: customer_notes });
                }
            });

            let customerController = global.SixCRM.routes.include('controllers','entities/Customer');

            return customerController.associatedEntitiesCheck({id: params.customer.id}).then((result) => {
                expect(result[0]).to.deep.equal({
                    name:'Customer Note',
                    entity: {
                        id: customer_notes[0].id
                    }
                });
                expect(result[1]).to.deep.equal({
                    name:'Session',
                    entity: {
                        id: session.id
                    }
                });
            });
        });
    });
});
