const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const random = require('@6crm/sixcrmcore/util/random').default;

function getValidCreditCard() {
	return MockEntities.getValidCreditCard();
}

function getValidCustomer() {
	return MockEntities.getValidCustomer();
}

describe('controllers/entities/CreditCard.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
			publish() {
				return Promise.resolve({});
			}
			getRegion() {
				return 'localhost';
			}
		});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
			sendMessage() {
				return Promise.resolve(true);
			}
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('get', () => {

		it('successfully returns a non-hydrated token when hydrate_token argument is not set', () => {

			let unhydrated_creditcard = MockEntities.getValidCreditCard();

			const EntityClass = global.SixCRM.routes.include('entities', 'Entity.js');
			EntityClass.prototype.get = ({id}) => {
				expect(id).to.be.defined;
				return Promise.resolve(unhydrated_creditcard);
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), EntityClass);

			mockery.registerMock(global.SixCRM.routes.path('providers', 'token/Token.js'), class {
				constructor() {}
				getToken() {
					expect(false).to.equal(true);
				}
			});

			let CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();

			return creditCardController.get({
				id: unhydrated_creditcard.id
			}).then(result => {
				expect(result).to.have.property('id');
				expect(result).not.to.have.property('number');
			});

		});

		it('returns a non-hydrated token when hydrate_token argument is not true', () => {

			let unhydrated_creditcard = MockEntities.getValidCreditCard();

			const EntityClass = global.SixCRM.routes.include('entities', 'Entity.js');
			EntityClass.prototype.get = ({id}) => {
				expect(id).to.be.defined;
				return Promise.resolve(unhydrated_creditcard);
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), EntityClass);

			mockery.registerMock(global.SixCRM.routes.path('providers', 'token/Token.js'), class {
				constructor() {}
				getToken() {
					expect(false).to.equal(true);
				}
			});

			let CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();

			return creditCardController.get({
				id: unhydrated_creditcard.id,
				hydrate_token: 'true'
			}).then(result => {
				expect(result).to.have.property('id');
				expect(result).not.to.have.property('number');
			});

		});

		it('successfully hydrates tokenized fields on get', () => {

			let unhydrated_creditcard = MockEntities.getValidCreditCard();
			let token_value = '41111111111111111';
			//let hydrated_creditcard = objectutilities.clone(unhydrated_creditcard);

			const EntityClass = global.SixCRM.routes.include('entities', 'Entity.js');
			EntityClass.prototype.get = ({id}) => {
				expect(id).to.be.defined;
				return Promise.resolve(unhydrated_creditcard);
			};
			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), EntityClass);

			mockery.registerMock(global.SixCRM.routes.path('providers', 'token/Token.js'), class {
				constructor() {}
				getToken() {
					return Promise.resolve(token_value);
				}
			});

			let CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();

			return creditCardController.get({
				id: unhydrated_creditcard.id,
				hydrate_token: true
			}).then(result => {
				expect(result).to.have.property('number');
				expect(result.number).to.equal(token_value);
			})

		});

	});

	describe('delete', () => {

		it('successfully deletes a creditcard', () => {

			let existing_creditcard = MockEntities.getValidCreditCard();

			const EntityClass = global.SixCRM.routes.include('entities', 'Entity.js');
			EntityClass.prototype.exists = ({
				entity
			}) => {
				expect(entity).to.be.defined;
				return Promise.resolve(existing_creditcard);
			};
			EntityClass.prototype.delete = ({
				id
			}) => {
				return Promise.resolve({
					id: id
				});
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), EntityClass);

			mockery.registerMock(global.SixCRM.routes.path('providers', 'token/Token.js'), class {
				constructor() {}
				deleteToken({
					token,
					provider
				}) {
					expect(token).to.be.defined;
					expect(provider).to.be.defined;
					return Promise.resolve(true);
				}
			});

			let CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();

			return creditCardController.delete({
				id: existing_creditcard.id
			}).then(result => {
				expect(result).to.deep.equal({
					id: existing_creditcard.id
				});
			})

		});

		it('returns a error when creditcard does not exist', () => {

			let existing_creditcard = MockEntities.getValidCreditCard();

			const EntityClass = global.SixCRM.routes.include('entities', 'Entity.js');
			EntityClass.prototype.exists = ({
				entity
			}) => {
				expect(entity).to.be.defined;
				return Promise.resolve(false);
			};
			EntityClass.prototype.delete = ({
				id
			}) => {
				return Promise.resolve({
					id: id
				});
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), EntityClass);

			mockery.registerMock(global.SixCRM.routes.path('providers', 'token/Token.js'), class {
				constructor() {}
				deleteToken() {
					return Promise.resolve(true);
				}
			});

			let CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();

			return creditCardController.delete({
				id: existing_creditcard.id
			}).catch(error => {
				expect(error.message).to.equal('[404] Unable to identify creditcard for delete.');
			});

		});

	});

	describe('updateProperties', () => {

		it('successfully updates a creditcard', () => {

			let existing_creditcard = MockEntities.getValidCreditCard();
			let update_properties = {
				name: 'A New Name',
				expiration: '10/20',
				address: {
					line1: '123 New Address',
					line2: 'Suite 43',
					city: 'Portland',
					state: 'OR',
					country: 'US',
					zip: '97203'
				},
				customers: existing_creditcard.customers.push(MockEntities.getValidId())
			};

			const EntityClass = global.SixCRM.routes.include('entities', 'Entity.js');
			EntityClass.prototype.update = ({
				entity
			}) => {
				return Promise.resolve(entity);
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), EntityClass);

			let CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();

			creditCardController.exists = () => {
				return Promise.resolve(existing_creditcard);
			}

			return creditCardController.updateProperties({
				id: existing_creditcard.id,
				properties: update_properties
			}).then((stored_creditcard) => {
				objectutilities.map(stored_creditcard, (key) => {
					if (_.has(update_properties, key)) {
						expect(stored_creditcard[key]).to.deep.equal(update_properties[key]);
					} else {
						expect(stored_creditcard[key]).to.deep.equal(existing_creditcard[key]);
					}
				});
			});

		});

		it('does not update a field that is not whitelisted', () => {

			let existing_creditcard = MockEntities.getValidCreditCard();
			let update_properties = {
				first_six: '123456',
				name: 'A New Name',
				expiration: '10/20',
				address: {
					line1: '123 New Address',
					line2: 'Suite 43',
					city: 'Portland',
					state: 'OR',
					country: 'US',
					zip: '97203'
				},
				customers: existing_creditcard.customers.push(MockEntities.getValidId())
			};

			const EntityClass = global.SixCRM.routes.include('entities', 'Entity.js');
			EntityClass.prototype.update = ({
				entity
			}) => {
				return Promise.resolve(entity);
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), EntityClass);

			let CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();

			creditCardController.exists = () => {
				return Promise.resolve(existing_creditcard);
			}

			return creditCardController.updateProperties({
				id: existing_creditcard.id,
				properties: update_properties
			}).then((stored_creditcard) => {
				objectutilities.map(stored_creditcard, (key) => {
					expect(stored_creditcard.first_six).to.equal(existing_creditcard.first_six);
					delete update_properties.first_six;
					if (_.has(update_properties, key)) {
						expect(stored_creditcard[key]).to.deep.equal(update_properties[key]);
					} else {
						expect(stored_creditcard[key]).to.deep.equal(existing_creditcard[key]);
					}
				});
			});

		});

		it('returns a error when creditcard does not exist', () => {

			let existing_creditcard = MockEntities.getValidCreditCard();
			let update_properties = {
				name: 'Test'
			};

			const EntityClass = global.SixCRM.routes.include('entities', 'Entity.js');
			EntityClass.prototype.exists = ({
				entity
			}) => {
				expect(entity).to.be.defined;
				return Promise.resolve(false);
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), EntityClass);

			let CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();

			return creditCardController.updateProperties({
				id: existing_creditcard.id,
				properties: update_properties
			}).catch(error => {
				expect(error.message).to.equal('[404] Credit Card not found.');
			});

		});

	});


	describe('update', () => {

		it('successfully updates a creditcard', () => {

			let existing_creditcard = MockEntities.getValidCreditCard();
			let updated_creditcard = objectutilities.clone(existing_creditcard);
			updated_creditcard.name = 'A New Name';
			updated_creditcard.expiration = '10/20';
			updated_creditcard.address = {
				line1: '123 New Address',
				line2: 'Suite 43',
				city: 'Portland',
				state: 'OR',
				country: 'US',
				zip: '97203'
			};
			updated_creditcard.customers = objectutilities.clone(existing_creditcard.customers);
			updated_creditcard.customers.push(MockEntities.getValidId());

			const EntityClass = global.SixCRM.routes.include('entities', 'Entity.js');
			EntityClass.prototype.update = ({
				entity
			}) => {
				return Promise.resolve(entity);
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), EntityClass);

			let CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();

			creditCardController.exists = () => {
				return Promise.resolve(existing_creditcard);
			}

			return creditCardController.update({
				entity: updated_creditcard
			}).then((stored_creditcard) => {
				expect(stored_creditcard).to.deep.equal(updated_creditcard);
			});

		});

		it('doesn\'t allow non-whitelisted fields', () => {

			let existing_creditcard = MockEntities.getValidCreditCard();
			let updated_creditcard = objectutilities.clone(existing_creditcard);
			updated_creditcard.name = 'A New Name';
			updated_creditcard.expiration = '10/20';
			updated_creditcard.address = {
				line1: '123 New Address',
				line2: 'Suite 43',
				city: 'Portland',
				state: 'OR',
				country: 'US',
				zip: '97203'
			};
			updated_creditcard.customers = objectutilities.clone(existing_creditcard.customers);
			updated_creditcard.customers.push(MockEntities.getValidId());
			updated_creditcard.first_six = '123456';

			const EntityClass = global.SixCRM.routes.include('entities', 'Entity.js');
			EntityClass.prototype.update = ({
				entity
			}) => {
				return Promise.resolve(entity);
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), EntityClass);

			let CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();

			creditCardController.exists = () => {
				return Promise.resolve(existing_creditcard);
			}

			return creditCardController.update({
				entity: updated_creditcard
			}).then((stored_creditcard) => {

				expect(stored_creditcard).not.to.deep.equal(updated_creditcard);
				delete stored_creditcard.first_six;
				delete updated_creditcard.first_six;
				expect(stored_creditcard).to.deep.equal(updated_creditcard);

			});

		});

		it('throws an error if the creditcard doesn\'t exist in the database', () => {

			//let creditcard = null;

			let existing_creditcard = MockEntities.getValidCreditCard();
			let updated_creditcard = objectutilities.clone(existing_creditcard);
			updated_creditcard.name = 'A New Name';
			updated_creditcard.expiration = '10/20';
			updated_creditcard.address = {
				line1: '123 New Address',
				line2: 'Suite 43',
				city: 'Portland',
				state: 'OR',
				country: 'US',
				zip: '97203'
			};
			updated_creditcard.customers = objectutilities.clone(existing_creditcard.customers);
			updated_creditcard.customers.push(MockEntities.getValidId());
			updated_creditcard.first_six = '123456';

			const EntityClass = global.SixCRM.routes.include('entities', 'Entity.js');
			EntityClass.prototype.update = ({
				entity
			}) => {
				return Promise.resolve(entity);
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), EntityClass);

			let CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();

			creditCardController.exists = () => {
				return Promise.resolve(false);
			}

			return creditCardController.update({
				entity: updated_creditcard
			}).catch(error => {
				expect(error.message).to.equal('[404] Credit Card not found.');
			});

		});

		xit('does not alter existing fields', () => {
			//Technical Debt:  Make sure that important stuff (that may be encrypted) doesn't change
		});

	});

	describe('create', () => {

		it('successfully creates a creditcard entity', () => {

			let creditcard_prototype = MockEntities.getValidTransactionCreditCard();
			let creditcard = MockEntities.getValidCreditCard();

			PermissionTestGenerators.givenUserWithAllowed('*', 'creditcard');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				constructor() {}
				saveRecord() {
					return Promise.resolve({
						Items: [creditcard]
					})
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), class {
				constructor() {}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'token/Token.js'), class {
				constructor() {}
				setToken({
					entity,
					provider
				}) {
					expect(entity).to.be.defined;
					expect(provider).to.satisfy((thing) => {
						return(_.isUndefined(thing) || _.isNull(thing) || _.isString(thing));
					});
					return {
						token: random.createRandomString(36),
						provider: 'tokenex'
					};
				}
			});

			let CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();

			creditCardController.exists = () => {
				return Promise.resolve(false);
			}

			return creditCardController.create({
				entity: creditcard_prototype
			}).then(() => {

				expect(true).to.equal(true);

			});

		});

	});

	describe('assureCreditCard', () => {

		it('assures that a creditcard is stored (creditcard exists)', () => {

			let existing_creditcard = MockEntities.getValidTransactionCreditCard();

			let stored_existing_creditcard = MockEntities.getValidCreditCard();
			stored_existing_creditcard.first_six = existing_creditcard.number.substring(0, 6);
			stored_existing_creditcard.last_four = existing_creditcard.number.slice(-4);

			let another_creditcard = MockEntities.getValidCreditCard();
			let creditcards = [stored_existing_creditcard, another_creditcard];

			const EntityClass = global.SixCRM.routes.include('entities', 'Entity.js');
			EntityClass.prototype.queryBySecondaryIndex = () => {
				return Promise.resolve({
					creditcards: creditcards
				});
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), EntityClass);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/creditcard/CreditCard.js'), class {
				constructor() {}
				sameCard(creditcard, testcard) {
					if ((creditcard.number.substring(0, 6) == testcard.first_six) && (creditcard.number.slice(-4) == testcard.last_four)) {
						return true;
					}
					return false;
				}
			});

			let CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();
			creditCardController.create = () => {
				//shouldn't get here.
				expect(false).to.equal(true);
			}

			creditCardController.sanitize(false);
			return creditCardController.assureCreditCard(existing_creditcard).then(result => {
				expect(result).to.deep.equal(stored_existing_creditcard);
			});

		});

		it('assures that a creditcard is stored (creditcard does not exist)', () => {

			let new_creditcard = MockEntities.getValidTransactionCreditCard();
			let creditcards = [];

			const EntityClass = global.SixCRM.routes.include('entities', 'Entity.js');
			EntityClass.prototype.queryBySecondaryIndex = () => {
				return Promise.resolve({
					creditcards: creditcards
				});
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), EntityClass);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/creditcard/CreditCard.js'), class {
				constructor() {}
				sameCard(creditcard, testcard) {
					expect(creditcard).to.be.defined;
					expect(testcard).to.be.defined;
					expect(false).to.equal(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'token/Token.js'), class {
				constructor() {}
				setToken({
					entity,
					provider
				}) {
					expect(entity).to.be.defined;
					expect(provider).to.satisfy((thing) => {
						return(_.isUndefined(thing) || _.isNull(thing) || _.isString(thing));
					});
					return {
						token: random.createRandomString(36),
						provider: 'tokenex'
					};
				}
			});

			let CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();
			creditCardController.create = ({
				entity
			}) => {
				expect(entity.number).to.equal(new_creditcard.number);
				return Promise.resolve(entity);
			}

			creditCardController.sanitize(false);
			return creditCardController.assureCreditCard(new_creditcard).then(result => {
				expect(result).to.deep.equal(new_creditcard);
			});

		});

		it('assures that a creditcard is stored (creditcard does not exist)', () => {

			let new_creditcard = MockEntities.getValidTransactionCreditCard();
			let non_matching_creditcard = MockEntities.getValidCreditCard();
			let creditcards = [non_matching_creditcard];

			const EntityClass = global.SixCRM.routes.include('entities', 'Entity.js');
			EntityClass.prototype.queryBySecondaryIndex = () => {
				return Promise.resolve({
					creditcards: creditcards
				});
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Entity.js'), EntityClass);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/creditcard/CreditCard.js'), class {
				constructor() {}
				sameCard(creditcard, testcard) {
					expect(creditcard).to.be.defined;
					expect(testcard).to.be.defined;
					return false;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'token/Token.js'), class {
				constructor() {}
				setToken({
					entity,
					provider
				}) {
					expect(entity).to.be.defined;
					expect(provider).to.satisfy((thing) => {
						return(_.isUndefined(thing) || _.isNull(thing) || _.isString(thing));
					});

					return {
						token: random.createRandomString(36),
						provider: 'tokenex'
					};
				}
			});

			let CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();
			creditCardController.create = ({
				entity
			}) => {
				expect(entity.number).to.equal(new_creditcard.number);
				return Promise.resolve(entity);
			}

			creditCardController.sanitize(false);
			return creditCardController.assureCreditCard(new_creditcard).then(result => {
				expect(result).to.deep.equal(new_creditcard);
			});

		});

	});

	describe('listCustomers', () => {
		it('gets customers', () => {
			const creditcard = getValidCreditCard();
			const customer = getValidCustomer();
			creditcard.customers = [customer.id];

			PermissionTestGenerators.givenUserWithAllowed('read', 'customer');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Customer.js'), class {
				batchGet() {
					return Promise.resolve([customer]);
				}
			});

			const CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard');
			const creditCardController = new CreditCardController();

			return creditCardController.listCustomers(creditcard)
				.then(customers => {
					expect(customers).to.include(customer);
				});
		});
	});
});
