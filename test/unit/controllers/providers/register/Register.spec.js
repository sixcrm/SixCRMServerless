
const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
const uuidV4 = require('uuid/v4');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidProcessResponse() {

	return {
		code: 'success',
		message: 'Success',
		merchant_provider: getValidMerchantProvider().id,
		creditcard: getValidCreditCard(),
		result: {}
	};

}

function getValidTransactionProducts() {

	return MockEntities.getValidTransactionProducts();

}

function getValidMerchantProviderGroups(ids) {
	return MockEntities.getValidMerchantProviderGroups(ids);
}

function getValidMerchantProvider() {
	return MockEntities.getValidMerchantProvider();
}

function getValidCreditCard() {
	return MockEntities.getValidCreditCard();
}

/*
function getValidPlaintextCreditCard(){
  return MockEntities.getValidPlaintextCreditCard();
}
*/

function getValidCreditCards() {
	return [
		getValidCreditCard()
	];
}

function getValidParentSession() {

	return MockEntities.getValidSession();

}

function getValidProduct() {
	return MockEntities.getValidProduct();
}

function getValidRebill() {

	return MockEntities.getValidRebill();

}

function getValidRebillWithMerchantProvider() {

	let rebill = MockEntities.getValidRebill();

	rebill.merchant_provider = "6c40761d-8919-4ad6-884d-6a46a776cfb9";
	return rebill;

}

function getValidAmount() {
	return 79.99;
}

function getValidProductSchedules() {

	return MockEntities.getValidProductSchedules();

}

function getValidCustomer() {
	return MockEntities.getValidCustomer();
}

function getValidTransactionID() {
	return 'e624af6a-21dc-4c64-b310-3b0523f8ca42';
}

function getValidTransactions() {
	return MockEntities.getValidTransactions();
}

function getValidTransactionObject() {
	return MockEntities.getValidTransaction();
}

function getValidAssociatedTransactions() {
	return MockEntities.getValidTransactions();
}

function getProcessorResponses(count) {
	let responses = [];

	for (var i = 0; i < count; i++) {
		responses.push(getProcessorResponseObject());
	}
	return responses;
}

function getProcessorResponseObject() {

	return MockEntities.getValidProcessorResponse();

}

function getInvalidArgumentsArray(omit) {

	let invalid_arguments = [{},
		[], new Error(), null, undefined, 123, 'abc', () => {}
	];

	omit = (_.isUndefined(omit)) ? [] : omit;
	return arrayutilities.filter(invalid_arguments, (invalid_argument) => {
		return !(_.includes(omit, invalid_argument));
	});

}

function assumePermissionedRole() {

	let permissions = [{
		action: '*',
		object: '*'
	}];

	PermissionTestGenerators.givenUserWithPermissionArray(permissions, 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

}


describe('controllers/providers/Register.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
			sendMessage() {
				return Promise.resolve(true);
			}
		});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
			publish() {
				return Promise.resolve({});
			}
			getRegion() {
				return 'localhost';
			}
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('hydrateSelectedCreditCard', () => {

		it('fails because the creditcard has neither a token nor a number', () => {

			const selected_creditcard = getValidCreditCard();
			delete selected_creditcard.token;
			delete selected_creditcard.number;

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();
			registerController.parameters.store['selectedcreditcard'] = selected_creditcard;

			try {
				registerController.hydrateSelectedCreditCard();
			} catch (error) {
				expect(error.message).to.equal('[500] Selected CreditCard must have either a number or a token.');
			}

		});

		it('returns true because the creditcard has a number', () => {

			const selected_creditcard = getValidCreditCard();
			selected_creditcard.number = '4111111111111111';

			const CreditCard = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');
			CreditCard.prototype.get = () => {
				expect(false).to.equal(true);
			}

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/CreditCard.js'), CreditCard);

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();
			registerController.parameters.set('selectedcreditcard', selected_creditcard);

			let result = registerController.hydrateSelectedCreditCard();
			expect(result).to.equal(true);

		});

		it('fails because the creditcard returns null', () => {

			const selected_creditcard = getValidCreditCard();

			const CreditCard = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');
			CreditCard.prototype.get = ({
				id,
				hydrate_token
			}) => {
				expect(id).to.equal(selected_creditcard.id);
				expect(hydrate_token).to.equal(true);
				return Promise.resolve(null);
			}
			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/CreditCard.js'), CreditCard);

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();
			registerController.parameters.set('selectedcreditcard', selected_creditcard);

			return registerController.hydrateSelectedCreditCard().catch(error => {
				expect(error.message).to.equal('[500] Unable to hydrate the selected creditcard');
			});

		});

		it('fails because the creditcard returns entity with no number', () => {

			const selected_creditcard = getValidCreditCard();

			const CreditCard = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');
			CreditCard.prototype.get = ({
				id,
				hydrate_token
			}) => {
				expect(id).to.equal(selected_creditcard.id);
				expect(hydrate_token).to.equal(true);
				return Promise.resolve(selected_creditcard);
			}
			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/CreditCard.js'), CreditCard);

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();
			registerController.parameters.set('selectedcreditcard', selected_creditcard);

			return registerController.hydrateSelectedCreditCard().catch(error => {
				expect(error.message).to.equal('[500] Unable to hydrate the selected creditcard');
			});

		});

		it('succeeds', () => {

			const selected_creditcard = getValidCreditCard();
			let token_value = '4111111111111111';
			const hydrated_creditcard = objectutilities.clone(selected_creditcard);
			hydrated_creditcard.number = token_value;

			const CreditCard = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');
			CreditCard.prototype.get = ({
				id,
				hydrate_token
			}) => {
				expect(id).to.equal(selected_creditcard.id);
				expect(hydrate_token).to.equal(true);
				return Promise.resolve(hydrated_creditcard);
			}
			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/CreditCard.js'), CreditCard);

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();
			registerController.parameters.set('selectedcreditcard', selected_creditcard);

			return registerController.hydrateSelectedCreditCard().then(result => {
				expect(result).to.equal(true);
				expect(registerController.parameters.store['selectedcreditcard']).to.deep.equal(hydrated_creditcard);
			});

		});

	});

	describe('hydrateTransaction', () => {

		it('fails because user does not have permission', () => {

			PermissionTestGenerators.givenUserWithAllowed('create', 'accesskey')

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let parameters = {
				transaction: getValidTransactionID()
			};

			return registerController.setParameters({
				argumentation: parameters,
				action: 'refund'
			}).then(() => {

				return registerController.hydrateTransaction().catch(error => {
					expect(error.message).to.equal('[403] Invalid Permissions: user does not have sufficient permission to perform this action.');
				});

			})

		});

		it('successfully hydrates a transaction object from ID', () => {

			let transaction = getValidTransactionObject();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				get() {
					return Promise.resolve(transaction);
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('read', 'transaction', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let parameters = {
				transaction: getValidTransactionID()
			};

			return registerController.setParameters({
				argumentation: parameters,
				action: 'refund'
			}).then(() => {
				return registerController.hydrateTransaction().then((transaction) => {
					let associated_transaction = registerController.parameters.get('associatedtransaction');

					expect(associated_transaction).to.deep.equal(transaction);

				});
			})

		});

		it('successfully hydrates a transaction object from object', () => {

			let transaction = getValidTransactionObject();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				get() {
					return Promise.resolve(transaction);
				}
			});

			//PermissionTestGenerators.givenUserWithAllowed('read', 'transaction', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let parameters = {
				transaction: transaction
			};

			return registerController.setParameters({
				argumentation: parameters,
				action: 'refund'
			}).then(() => {
				return registerController.hydrateTransaction().then(() => {
					let associated_transaction = registerController.parameters.get('associatedtransaction');

					expect(associated_transaction).to.deep.equal(transaction);
				});
			});

		});

	});

	//Technical Debt:  This belongs in the test package from the Parameters.js object
	describe('setParameters', () => {

		//Technical Debt: test invalid argumentation types...

		it('fails to set parameters due to missing required parameters', () => {

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let parameters = {}

			try {
				registerController.setParameters({
					argumentation: parameters,
					action: 'refund'
				});
			} catch (error) {
				expect(error.message).to.equal('[500] Missing source object field: "transaction".');
			}

		});

		it('fails to set parameters due to invalid parameter types', () => {

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			arrayutilities.map(getInvalidArgumentsArray([undefined]), (invalid_argument) => {

				try {
					registerController.setParameters({
						argumentation: {
							transaction: invalid_argument
						},
						action: 'refund'
					});
				} catch (error) {
					expect(error.message).to.have.string('[500] One or more validation errors occurred:');
				}

			});

		});

		it('successfully sets parameters', () => {

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let transaction_id = getValidTransactionID();

			return registerController.setParameters({
				argumentation: {
					transaction: transaction_id
				},
				action: 'refund'
			}).then(() => {
				let transaction = registerController.parameters.get('transaction');

				expect(transaction).to.equal(transaction_id);
			});

		});

		it('successfully sets parameters', () => {

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let transaction_object = getValidTransactionObject();

			return registerController.setParameters({
				argumentation: {
					transaction: transaction_object
				},
				action: 'refund'
			}).then(() => {
				let transaction = registerController.parameters.get('transaction');

				expect(transaction).to.deep.equal(transaction_object);
			});

		});

	});

	describe('getAssociatedTransactions', () => {

		it('successfully gets associated transactions (empty array)', () => {

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				listByAssociatedTransaction() {
					return Promise.resolve({
						transactions: null
					});
				}
				getResult(result, field) {
					if (_.has(result, field)) {
						return Promise.resolve(result[field]);
					} else {
						return Promise.resolve(null);
					}
				}
			});

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let transaction_object = getValidTransactionObject();

			registerController.parameters.set('associatedtransaction', transaction_object);

			return registerController.getAssociatedTransactions().then(() => {
				let associatedtransactions = registerController.parameters.get('associated_transactions');

				expect(associatedtransactions).to.deep.equal([]);
			});

		});

		it('successfully gets associated transactions (non-empty array)', () => {

			let transaction = getValidTransactionObject();
			let associated_transactions = getValidAssociatedTransactions();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				listByAssociatedTransaction() {
					return Promise.resolve({
						transactions: associated_transactions
					});
				}
				getResult(result, field) {
					if (_.has(result, field)) {
						return Promise.resolve(result[field]);
					} else {
						return Promise.resolve(null);
					}
				}
			});

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			registerController.parameters.set('associatedtransaction', transaction);

			return registerController.getAssociatedTransactions().then(() => {
				let associatedtransactions = registerController.parameters.get('associated_transactions');

				expect(associatedtransactions).to.deep.equal(associated_transactions);
			});

		});

	});

	describe('validateAssociatedTransactions', () => {

		it('returns error when transaction with pre-existing refunds/reversals can\'t be reversed', () => {

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let associated_transactions = getValidAssociatedTransactions();

			registerController.parameters.set('associated_transactions', associated_transactions);

			try {
				registerController.validateAssociatedTransactions();
				expect(false).to.equal(true);
			} catch (error) {
				expect(error.message).to.equal('[403] A transaction with pre-existing refunds or reversals can not be reversed.');
			}

		});

		it('successfully validates associated transactions', () => {

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			return registerController.validateAssociatedTransactions().then((validated) => {
				expect(validated).to.equal(true);
			});

		});

	});

	describe('setAmount', () => {

		it('successfully sets amount when amount is not set in parameters', () => {

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let transaction_object = getValidTransactionObject();

			registerController.parameters.set('associatedtransaction', transaction_object);

			return registerController.setAmount()
				.then(() => {
					let set_amount = registerController.parameters.get('amount');

					expect(set_amount).to.equal(transaction_object.amount);
				});

		});

		it('successfully gets amount when amount is set in parameters', () => {

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let transaction_object = getValidTransactionObject();

			return registerController.setParameters({
				argumentation: {
					transaction: transaction_object,
					amount: transaction_object.amount
				},
				action: 'refund'
			}).then(() => {
				registerController.setAmount()
					.then(() => {
						let set_amount = registerController.parameters.get('amount');

						expect(set_amount).to.equal(transaction_object.amount);
					});

			});

		});

	});

	describe('calculateReversedAmount(', () => {

		it('successfully calculates the reversed amount when there are no associated_transactions', () => {

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let reversed_amount = registerController.calculateReversedAmount();

			expect(reversed_amount).to.equal(0);

		});

		it('successfully calculates the reversed amount', () => {

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let associated_transactions = getValidAssociatedTransactions();

			let validation_amount = arrayutilities.reduce(associated_transactions, (sum, transaction) => {
				return (sum + parseFloat(transaction.amount));
			})

			let reversed_amount = registerController.calculateReversedAmount(associated_transactions);

			expect(reversed_amount).to.equal(validation_amount)

		});

	});

	describe('validateAmount', () => {

		it('successfully validates amount (no associated transactions)', () => {

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let transaction = getValidTransactionObject();

			registerController.parameters.set('associatedtransaction', transaction);

			registerController.parameters.set('amount', transaction.amount);

			return registerController.validateAmount().then((valid) => {
				expect(valid).to.equal(true);
			});

		});

		it('successfully validates amount (no associated transactions)', () => {

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let transaction = getValidTransactionObject();

			registerController.parameters.set('associatedtransaction', transaction);

			registerController.parameters.set('amount', transaction.amount + 0.01);

			try {

				registerController.validateAmount();

			} catch (error) {

				expect(error.message).to.equal('[403] The proposed resolved transaction amount is negative.');

			}

		});

		it('successfully validates amount (reversals exceed transaction amount)', () => {

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let transaction = getValidTransactionObject();

			let associated_transactions = getValidAssociatedTransactions();

			registerController.parameters.set('associatedtransaction', transaction);

			registerController.parameters.set('associated_transactions', associated_transactions);

			registerController.parameters.set('amount', transaction.amount);

			try {

				registerController.validateAmount()

			} catch (error) {

				expect(error.message).to.equal('[403] The proposed resolved transaction amount is negative.');

			}


		});

		it('successfully validates amount (reversals do not exceed transaction amount)', () => {

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let transaction = getValidTransactionObject();

			let associated_transactions = getValidAssociatedTransactions();

			arrayutilities.map(associated_transactions, (at, index) => {
				associated_transactions[index].amount = 0.00;
			});

			registerController.parameters.set('associatedtransaction', transaction);

			registerController.parameters.set('associated_transactions', associated_transactions);

			registerController.parameters.set('amount', transaction.amount);

			registerController.validateAmount().then((validated) => {
				expect(validated).to.equal(true);
			});

		});

		it('successfully validates amount (reversals do not exceed transaction amount and amount is a specific not the full amount)', () => {

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let transaction = getValidTransactionObject();
			let associated_transactions = getValidAssociatedTransactions();

			arrayutilities.map(associated_transactions, (at, index) => {
				associated_transactions[index].amount = randomutilities.randomDouble(0, 1.00);
			});

			registerController.parameters.set('associatedtransaction', transaction);
			registerController.parameters.set('associated_transactions', associated_transactions);
			registerController.parameters.set('amount', 1.00);

			registerController.validateAmount().then((validated) => {
				expect(validated).to.equal(true);
			});

		});

	});

	describe('executeRefund', () => {

		it('successfully executes a refund', () => {

			let fake = class Refund {

				constructor() {

				}

				refund() {

					return Promise.resolve({
						code: 'error',
						result: {
							response: '3',
							responsetext: 'Refund amount may not exceed the transaction balance REFID:3220888806',
							authcode: '',
							transactionid: '',
							avsresponse: '',
							cvvresponse: '',
							orderid: '',
							type: 'refund',
							response_code: '300'
						},
						message: 'Refund amount may not exceed the transaction balance REFID:3220888806'
					});

				}

			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/Refund.js'), fake);

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let transaction = getValidTransactionObject();

			let associated_transactions = getValidAssociatedTransactions();

			arrayutilities.map(associated_transactions, (at, index) => {
				associated_transactions[index].amount = randomutilities.randomDouble(0, 1.00);
			});

			registerController.parameters.set('associatedtransaction', transaction);

			registerController.parameters.set('amount', 1.00);

			return registerController.executeRefund().then(() => {

				let response = registerController.parameters.get('processorresponse');

				expect(response).to.have.property('message');
				expect(response).to.have.property('code');
				expect(response).to.have.property('result');

			});

		});

	});

	describe('executeReverse', () => {

		it('successfully executes a reverse', () => {

			let fake = class Reverse {

				constructor() {

				}

				reverse() {

					return Promise.resolve({
						code: 'error',
						result: {
							response: '3',
							responsetext: 'Reverse amount may not exceed the transaction balance REFID:3220888806',
							authcode: '',
							transactionid: '',
							avsresponse: '',
							cvvresponse: '',
							orderid: '',
							type: 'refund',
							response_code: '300'
						},
						message: 'Reverse amount may not exceed the transaction balance REFID:3220888806'
					});

				}

			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/Reverse.js'), fake);

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let transaction = getValidTransactionObject();

			let associated_transactions = getValidAssociatedTransactions();

			arrayutilities.map(associated_transactions, (at, index) => {
				associated_transactions[index].amount = randomutilities.randomDouble(0, 1.00);
			});

			registerController.parameters.set('associatedtransaction', transaction);

			return registerController.executeReverse().then(() => {

				let response = registerController.parameters.get('processorresponse');

				expect(response).to.have.property('message');
				expect(response).to.have.property('code');
				expect(response).to.have.property('result');

			});

		});

	});

	describe('executeProcess', () => {

		it('successfully executes a process', () => {

			let rebill = getValidRebill();
			let merchant_provider = getValidMerchantProvider();

			rebill.merchant_provider = merchant_provider.id;
			let merchant_provider_groups = getValidMerchantProviderGroups([merchant_provider.id]);

			merchant_provider_groups[merchant_provider.id] = [rebill.products];

			let customer = getValidCustomer();
			let creditcard = getValidCreditCard();
			let amount = getValidAmount();

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/Process.js'), class Process {
				constructor() {}
				process() {
					return Promise.resolve({
						getCode: () => {
							return 'error';
						},
						getMessage: () => {
							return 'Refund amount may not exceed the transaction balance REFID:3220888806';
						},
						getResult: () => {
							return {
								response: '3',
								responsetext: 'Refund amount may not exceed the transaction balance REFID:3220888806',
								authcode: '',
								transactionid: '',
								avsresponse: '',
								cvvresponse: '',
								orderid: '',
								type: 'refund',
								response_code: '300'
							};
						},
						merchant_provider: merchant_provider.id,
						creditcard: creditcard.id,
						code: 'error',
						result: {
							response: '3',
							responsetext: 'Refund amount may not exceed the transaction balance REFID:3220888806',
							authcode: '',
							transactionid: '',
							avsresponse: '',
							cvvresponse: '',
							orderid: '',
							type: 'refund',
							response_code: '300'
						},
						message: 'Refund amount may not exceed the transaction balance REFID:3220888806'
					});
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Transaction.js'), class {
				create({
					entity
				}) {
					entity.id = uuidV4();
					entity.created_at = timestamp.getISO8601();
					entity.updated_at = timestamp.getISO8601();

					return Promise.resolve(entity);
				}
				createAlias() {
					return 'T' + randomutilities.createRandomString(9);
				}
			});

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();


			registerController.parameters.set('rebill', rebill);
			registerController.parameters.set('customer', customer);
			registerController.parameters.set('selectedcreditcard', creditcard)
			registerController.parameters.set('merchantprovidergroups', merchant_provider_groups);

			return registerController.executeProcess({
				merchant_provider: merchant_provider.id,
				amount: amount
			}).then((result) => {

				expect(result).to.equal(true);

				//let response = registerController.parameters.get('processorresponses');

				//expect(response).to.have.property('message');
				//expect(response).to.have.property('code');
				//expect(response).to.have.property('result');

			});

		});

	});

	xdescribe('issueReceipt', () => {

		it('creates a transaction receipt for successful sale', () => {

			let rebill = getValidRebill();
			let transaction = getValidTransactionObject();
			let processor_response = getProcessorResponseObject();

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Receipt.js'), class {
				constructor() {}
				issueReceipt() {
					return Promise.resolve(getValidTransactionObject());
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return true;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), class {
				constructor() {}
				addToSearchIndex() {
					return Promise.resolve(true);
				}
				removeFromSearchIndex() {
					return Promise.resolve(true);
				}
			});
			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				get({
					id
				}) {
					expect(id).to.equal(transaction.rebill);
					return Promise.resolve(rebill);
				}
			});

			assumePermissionedRole();

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			registerController.parameters.set('rebill', rebill);
			registerController.parameters.set('transactiontype', 'sale');
			registerController.parameters.set('amount', 10.00);
			registerController.parameters.set('processorresponse', processor_response);
			registerController.parameters.set('merchantprovider', getValidMerchantProvider());
			registerController.parameters.set('transactionproducts', getValidTransactionProducts());
			registerController.parameters.set('associatedtransaction', transaction);

			return registerController.issueReceipt().then(() => {

				let result_transaction = registerController.parameters.get('receipttransaction');

				expect(result_transaction).to.have.property('id');
				expect(result_transaction).to.have.property('type');
				expect(result_transaction.type).to.equal('sale');
				expect(result_transaction.result).to.equal('success');

			});

		});

		it('creates a transaction for sale fail', () => {

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Receipt.js'), class {
				constructor() {}
				issueReceipt() {
					let transaction = getValidTransactionObject();

					transaction.result = 'fail';
					return Promise.resolve(transaction);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return true;
				}
			});

			let mock_preindexing_helper = class {
				constructor() {

				}
				addToSearchIndex() {
					return Promise.resolve(true);
				}
				removeFromSearchIndex() {
					return Promise.resolve(true);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			assumePermissionedRole();

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let transaction = getValidTransactionObject();
			let processor_response = getProcessorResponseObject();

			processor_response.code = 'fail';

			registerController.parameters.set('rebill', getValidRebill());
			registerController.parameters.set('transactiontype', 'sale');
			registerController.parameters.set('associatedtransaction', transaction);
			registerController.parameters.set('amount', 10.00);
			registerController.parameters.set('processorresponse', processor_response);
			registerController.parameters.set('merchantprovider', getValidMerchantProvider());
			registerController.parameters.set('transactionproducts', getValidTransactionProducts());

			return registerController.issueReceipt().then(() => {

				let result_transaction = registerController.parameters.get('receipttransaction');

				expect(result_transaction).to.have.property('id');
				expect(result_transaction).to.have.property('type');
				expect(result_transaction).to.have.property('result');
				expect(result_transaction.type).to.equal('sale');
				expect(result_transaction.result).to.equal('fail');

			});

		});

		it('creates a transaction for refund error', () => {

			let mock_receipt = class {
				constructor() {}
				issueReceipt() {
					let transaction = getValidTransactionObject();

					transaction.type = 'refund';
					transaction.result = 'error';
					transaction.associated_transaction = transaction.id;
					return Promise.resolve(transaction);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Receipt.js'), mock_receipt);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return true;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), class {
				constructor() {}
				addToSearchIndex() {
					return Promise.resolve(true);
				}
				removeFromSearchIndex() {
					return Promise.resolve(true);
				}
			});

			assumePermissionedRole();

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			let transaction = getValidTransactionObject();
			let processor_response = getProcessorResponseObject();

			processor_response.code = 'error';

			registerController.parameters.set('rebill', getValidRebill());
			registerController.parameters.set('transactiontype', 'refund');
			registerController.parameters.set('associatedtransaction', transaction);
			registerController.parameters.set('amount', 10.00);
			registerController.parameters.set('processorresponse', processor_response);

			return registerController.issueReceipt().then(() => {

				let receipt_transaction = registerController.parameters.get('receipttransaction');

				expect(receipt_transaction).to.have.property('id');
				expect(receipt_transaction).to.have.property('associated_transaction');
				expect(receipt_transaction).to.have.property('type');
				expect(receipt_transaction).to.have.property('result');
				expect(receipt_transaction.associated_transaction).to.equal(transaction.id);
				expect(receipt_transaction.type).to.equal('refund');
				expect(receipt_transaction.result).to.equal('error');

			});

		});

		xit('rejects when creation of transaction was unsuccessful', () => {

			assumePermissionedRole();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord() {
					return Promise.reject(new Error('Saving failed.'));
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return true;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), class {
				constructor() {}
				addToSearchIndex() {
					return Promise.resolve(true);
				}
				removeFromSearchIndex() {
					return Promise.resolve(true);
				}
			});

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			registerController.parameters.set('rebill', getValidRebill());
			registerController.parameters.set('amount', getValidAmount());
			registerController.parameters.set('transactiontype', 'sale');
			registerController.parameters.set('merchantprovider', getValidMerchantProvider());
			registerController.parameters.set('transactionproducts', getValidTransactionProducts());

			let processor_response = getProcessorResponseObject();

			processor_response.code = 'error';
			registerController.parameters.set('processorresponse', processor_response);

			return registerController.issueReceipt().catch((error) => {
				expect(error.message).to.equal('Saving failed.');
			});

		});

	});

	describe('validateRebillTimestamp', () => {

		it('successfully validates a rebill timestamp', () => {

			let valid_rebill = getValidRebill();

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			registerController.parameters.set('rebill', valid_rebill);

			return registerController.validateRebillTimestamp().then(result => {
				expect(result).to.equal(true);
			});

		});

		it('returns error if rebill is not eligible for processing at this time', (done) => {

			let valid_rebill = getValidRebill();

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			registerController.parameters.set('rebill', valid_rebill);

			valid_rebill.bill_at = timestamp.tomorrow();

			try {
				registerController.validateRebillTimestamp()
			} catch (error) {
				expect(error.message).to.have.string('[500] Rebill is not eligible for processing at this time');
				done();
			}

		});

	});

	describe('validateAttemptRecord', () => {

		it('successfully validates a rebill against attempt record', () => {

			let valid_rebill = getValidRebill();

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			registerController.parameters.set('rebill', valid_rebill);

			return registerController.validateRebillTimestamp().then(result => {
				expect(result).to.equal(true);
			});

		});

		it('returns error if rebill has been attempted three times', (done) => {

			let valid_rebill = getValidRebill();

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			registerController.parameters.set('rebill', valid_rebill);

			valid_rebill.second_attempt = Date.now();

			try {
				registerController.validateAttemptRecord()
			} catch (error) {
				expect(error.message).to.equal('[500] The rebill has already been attempted three times.');
				done()
			}

		});

		it('returns error if rebill attempt was too recent', (done) => {

			let valid_rebill = getValidRebill();

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			registerController.parameters.set('rebill', valid_rebill);

			valid_rebill.first_attempt = Date.now();

			try {
				registerController.validateAttemptRecord()
			} catch (error) {
				expect(error.message).to.equal('[500] Rebill\'s first attempt is too recent.');
				done()
			}

		});

	});

	describe('acquireRebillProperties', () => {

		it('successfully acquires rebill properties', () => {

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				listProductSchedules() {
					return Promise.resolve(getValidProductSchedules());
				}
				getParentSession() {
					return Promise.resolve(getValidParentSession());
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			let valid_rebill = getValidRebill();

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			registerController.parameters.set('rebill', valid_rebill);

			return registerController.acquireRebillProperties().then(result => {

				expect(result).to.equal(true);

				//let parentsession = registerController.parameters.get('parentsession');

			});

		});

	});

	describe('validateSession', () => {

		it('successfully validates a parent session', () => {

			let parent_session = getValidParentSession();

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			registerController.parameters.set('parentsession', parent_session);

			return registerController.validateSession().then(result => {

				expect(result).to.equal(true);

			});

		});

		it('returns error when session has invalid day in cycle', () => {

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
				constructor() {}
				calculateDayInCycle() {
					return -1; //any negative number
				}
			});

			let parent_session = getValidParentSession();

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			registerController.parameters.set('parentsession', parent_session);

			try {
				registerController.validateSession()
			} catch (error) {
				expect(error.message).to.equal('[500] Invalid day in cycle returned for session.');
			}

		});

	});

	describe('validateRebillForProcessing', () => {

		it('successfully validates a rebill', () => {

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				listProductSchedules() {
					return Promise.resolve(getValidProductSchedules());
				}
				getParentSession() {
					return Promise.resolve(getValidParentSession());
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
				constructor() {}
				calculateDayInCycle(session_start) {
					return timestamp.getDaysDifference(session_start);
				}
				isAvailable() {
					return true;
				}
			});

			let rebill = getValidRebill();
			let parentsession = getValidParentSession();

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			registerController.parameters.set('rebill', rebill);
			registerController.parameters.set('parentsession', parentsession);

			return registerController.validateRebillForProcessing().then(result => {

				expect(result).to.equal(true);

			}).catch(error => {

				throw error;

			});

		});

	});

	describe('selectCustomerCreditCard', () => {

		it('adds the ccv if the selected creditcard is present and the raw creditcard is present', () => {

			let selected_creditcard = MockEntities.getValidCreditCard();
			selected_creditcard.number = '4111111111111111';

			let raw_creditcard = MockEntities.getValidTransactionCreditCard();

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();
			registerController.parameters.set('selectedcreditcard', selected_creditcard);
			registerController.parameters.set('rawcreditcard', raw_creditcard);

			return registerController.selectCustomerCreditCard().then(result => {
				expect(result).to.equal(true);
				expect(registerController.parameters.store['selectedcreditcard'].cvv).to.equal(raw_creditcard.cvv);
			});
		});

		it('adds the ccv if the selected creditcard is present and the raw creditcard is present', () => {

			let selected_creditcard = MockEntities.getValidCreditCard();
			selected_creditcard.number = '4111111111111111';

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();
			registerController.parameters.set('selectedcreditcard', selected_creditcard);

			return registerController.selectCustomerCreditCard().then(result => {
				expect(result).to.equal(true);
				expect(registerController.parameters.store['selectedcreditcard']).not.to.have.property('cvv');
			});

		});

	});

	describe('acquireRebillSubProperties', () => {

		it('successfully acquires rebill subproperties', () => {

			let rebill = getValidRebill();
			let parentsession = getValidParentSession();
			let merchant_provider_groups = getValidMerchantProviderGroups();

			let mock_customer = class {
				constructor() {}

				get() {
					return Promise.resolve(getValidCustomer())
				}
				getCreditCards() {
					return Promise.resolve(getValidCreditCards())
				}
				sanitize(input) {
					expect(input).to.equal(false);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/MerchantProviderSelector.js'), class {
				constructor() {}
				buildMerchantProviderGroups() {
					return Promise.resolve(merchant_provider_groups);
				}
			});

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			registerController.parameters.set('rebill', rebill);
			registerController.parameters.set('parentsession', parentsession);

			return registerController.acquireRebillSubProperties().then(result => {

				expect(result).to.equal(true);

				let creditcards = registerController.parameters.get('creditcards');
				let customer = registerController.parameters.get('customer');
				let selected_creditcard = registerController.parameters.get('selectedcreditcard');
				let merchant_provider_groups = registerController.parameters.get('merchantprovidergroups');

				expect(creditcards).to.not.be.undefined;
				expect(customer).to.not.be.undefined;
				expect(selected_creditcard).to.not.be.undefined;
				expect(merchant_provider_groups).to.not.be.undefined;

			});

		});

	});

	describe('transformResponse', () => {

		it('successfully responds to success', () => {

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();
			let transactions = getValidTransactions();
			let processor_responses = getProcessorResponses(transactions.length);
			let creditcard = getValidCreditCard();

			registerController.parameters.set('transactionreceipts', transactions);
			registerController.parameters.set('processorresponses', processor_responses);
			registerController.parameters.set('selectedcreditcard', creditcard)

			return registerController.transformResponse().then(response => {

				expect(objectutilities.getClassName(response)).to.equal('RegisterResponse');
				expect(response.getCode()).to.equal('success');
				expect(response.getTransactions()).to.deep.equal(transactions);
				expect(response.getProcessorResponses()).to.deep.equal(processor_responses);

			});

		});

		it('successfully responds to fail', () => {

			let processor_responses = getProcessorResponses(1);

			processor_responses[0].code = 'fail';

			let fail_transaction = getValidTransactionObject();

			fail_transaction.result = 'fail';

			let creditcard = getValidCreditCard();

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			registerController.parameters.set('transactionreceipts', [fail_transaction]);
			registerController.parameters.set('processorresponses', processor_responses);
			registerController.parameters.set('selectedcreditcard', creditcard)

			return registerController.transformResponse().then(response => {

				expect(objectutilities.getClassName(response)).to.equal('RegisterResponse');
				expect(response.getCode()).to.equal('fail');
				expect(response.getTransactions()).to.deep.equal([fail_transaction]);
				expect(response.getProcessorResponses()).to.deep.equal(processor_responses);

			});

		});

		it('successfully responds to error', () => {

			let processor_responses = getProcessorResponses(1);

			processor_responses[0].code = 'error';

			let error_transaction = getValidTransactionObject();

			error_transaction.result = 'error';

			let creditcard = getValidCreditCard();

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			registerController.parameters.set('transactionreceipts', [error_transaction]);
			registerController.parameters.set('processorresponses', processor_responses);
			registerController.parameters.set('selectedcreditcard', creditcard)

			return registerController.transformResponse().then(response => {

				expect(objectutilities.getClassName(response)).to.equal('RegisterResponse');
				expect(response.getCode()).to.equal('error');
				expect(response.getTransactions()).to.deep.equal([error_transaction]);
				expect(response.getProcessorResponses()).to.deep.equal(processor_responses);

			});

		});

	});

	describe('processTransaction', () => {

		xit('successfully processes a transaction', () => {

			let creditcard = getValidCreditCard();

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Response.js'), class RegisterResponse {
				constructor() {}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Receipt.js'), class {
				constructor() {}
				issueReceipt() {
					let transaction = getValidTransactionObject();

					return Promise.resolve(transaction);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/Process.js'), class {
				constructor() {}
				process() {
					return Promise.resolve(getValidProcessResponse());
				}
			});

			let mock_credit_card = class {
				constructor() {}
				get() {
					return Promise.resolve(creditcard);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), mock_credit_card);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), class {
				listProductSchedules() {
					return Promise.resolve(getValidProductSchedules());
				}
				getParentSession() {
					return Promise.resolve(getValidParentSession())
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
				constructor() {}
				calculateDayInCycle(session_start) {
					return timestamp.getDaysDifference(session_start);
				}
				isAvailable() {
					return true;
				}
			});

			let mock_customer = class {
				constructor() {}

				get() {
					return Promise.resolve(getValidCustomer())
				}
				getCreditCards() {
					return Promise.resolve(getValidCreditCards())
				}
				getID(object) {

					if (_.isString(object)) {
						return object;
					} else if (_.isObject(object)) {
						if (_.has(object, 'id')) {
							return object['id'];
						}
					} else if (_.isNull(object)) {
						return null;
					}
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/ProductSchedule.js'), class {
				getID(object) {

					if (_.isString(object)) {
						return object;
					} else if (_.isObject(object)) {
						if (_.has(object, 'id')) {
							return object['id'];
						}
					} else if (_.isNull(object)) {
						return null;
					}

				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return true;
				}
			});

			let mock_preindexing_helper = class {
				constructor() {}
				addToSearchIndex() {
					return Promise.resolve(true);
				}
				removeFromSearchIndex() {
					return Promise.resolve(true);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/MerchantProvider.js'), class {
				get() {
					return Promise.resolve(getValidMerchantProvider());
				}
			});

			let valid_rebill = getValidRebill();

			PermissionTestGenerators.givenUserWithAllowed('*', '*');

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			return registerController.processTransaction({
				rebill: valid_rebill
			}).then(result => {

				expect(objectutilities.getClassName(result)).to.equal('RegisterResponse');

			});

		});

	});

	describe('reverseTransaction', () => {

		xit('successfully reverses a transaction', () => {

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Response.js'), class RegisterResponse {
				constructor() {}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Receipt.js'), class {
				constructor() {}
				issueReceipt() {
					let transaction = getValidTransactionObject();

					return Promise.resolve(transaction);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				get() {
					return Promise.resolve(getValidTransactionObject())
				}
				listByAssociatedTransaction() {
					return Promise.resolve({
						transactions: []
					});
				}
				getResult(result, field) {

					du.debug('Get Result');

					if (_.isUndefined(field)) {
						field = this.descriptive_name + 's';
					}

					if (_.has(result, field)) {
						return Promise.resolve(result[field]);
					} else {
						return Promise.resolve(null);
					}

				}
				getMerchantProvider() {
					return Promise.resolve(getValidMerchantProvider());
				}
				getID(object) {

					if (_.isString(object)) {
						return object;
					} else if (_.isObject(object)) {
						if (_.has(object, 'id')) {
							return object['id'];
						}
					} else if (_.isNull(object)) {
						return null;
					}

				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return true;
				}
			});

			let mock_preindexing_helper = class {
				constructor() {

				}
				addToSearchIndex() {
					return Promise.resolve(true);
				}
				removeFromSearchIndex() {
					return Promise.resolve(true);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/Reverse.js'), class {
				constructor() {}
				reverse() {
					return Promise.resolve(getValidProcessResponse());
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), class {
				get() {
					return Promise.resolve(getValidRebillWithMerchantProvider())
				}
				getMerchantProvider() {
					return Promise.resolve(getValidMerchantProvider())
				}
				getParentSession() {
					return Promise.resolve(getValidParentSession());
				}
				listProductSchedules() {
					return Promise.resolve(getValidProductSchedules());
				}
			});

			let mock_customer = class {
				constructor() {}

				get() {
					return Promise.resolve(getValidCustomer())
				}
				getCreditCards() {
					return Promise.resolve(getValidCreditCards())
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/productschedule/ProductSchedule.js'), class {
				constructor() {}
				getTransactionProducts() {
					return Promise.resolve([]);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
				constructor() {}
				calculateDayInCycle() {
					return Promise.resolve(5);
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('*', '*');

			let valid_transaction = getValidTransactionObject();

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			return registerController.reverseTransaction({
				transaction: valid_transaction
			}).then(result => {

				expect(objectutilities.getClassName(result)).to.equal('RegisterResponse');

			});

		});

	});

	describe('refundTransaction', () => {

		xit('successfully reverses a transaction', () => {

			let mock_register_response = class RegisterResponse {
				constructor() {}
			};

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Response.js'), mock_register_response);

			let mock_receipt = class {
				constructor() {}
				issueReceipt() {
					let transaction = getValidTransactionObject();

					return Promise.resolve(transaction);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Receipt.js'), mock_receipt);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Transaction.js'), class {
				get() {
					return Promise.resolve(getValidTransactionObject())
				}
				listByAssociatedTransaction() {
					return Promise.resolve({
						transactions: []
					});
				}
				getResult(result, field) {

					du.debug('Get Result');

					if (_.isUndefined(field)) {
						field = this.descriptive_name + 's';
					}

					if (_.has(result, field)) {
						return Promise.resolve(result[field]);
					} else {
						return Promise.resolve(null);
					}

				}
				getMerchantProvider() {
					return Promise.resolve(getValidMerchantProvider());
				}
				getID(object) {

					if (_.isString(object)) {
						return object;
					} else if (_.isObject(object)) {
						if (_.has(object, 'id')) {
							return object['id'];
						}
					} else if (_.isNull(object)) {
						return null;
					}

				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return true;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), class {
				constructor() {}
				addToSearchIndex() {
					return Promise.resolve(true);
				}
				removeFromSearchIndex() {
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/Refund.js'), class {
				constructor() {}
				refund() {
					return Promise.resolve(getValidProcessResponse());
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), class {
				get() {
					return Promise.resolve(getValidRebillWithMerchantProvider())
				}
				getMerchantProvider() {
					return Promise.resolve(getValidMerchantProvider())
				}
				getParentSession() {
					return Promise.resolve(getValidParentSession());
				}
				listProductSchedules() {
					return Promise.resolve(getValidProductSchedules());
				}
			});

			let mock_customer = class {
				constructor() {}

				get() {
					return Promise.resolve(getValidCustomer())
				}
				getCreditCards() {
					return Promise.resolve(getValidCreditCards())
				}
				sanitize(input) {
					expect(input).to.equal(false);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/productschedule/ProductSchedule.js'), class {
				constructor() {}
				getTransactionProducts() {
					return Promise.resolve([]);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
				constructor() {}
				calculateDayInCycle() {
					return Promise.resolve(5);
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('*', '*');

			let valid_transaction = getValidTransactionObject();

			du.warning(valid_transaction);

			let valid_amount = (valid_transaction.amount - 10.00);

			const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
			let registerController = new RegisterController();

			return registerController.refundTransaction({
				transaction: valid_transaction,
				amount: valid_amount
			}).then(result => {

				expect(objectutilities.getClassName(result)).to.equal('RegisterResponse');

			});

		});

	});

	describe('calculateAmountFromProductGroups', () => {

		it('correctly calculates the amount', () => {

			let test_cases = [{
					a: 3.99,
					b: 0.14
				},
				{
					a: 3.99,
					b: 1.00
				},
				{
					a: 39239238923.99,
					b: 123.00
				}
			];

			arrayutilities.map(test_cases, test_case => {

				let product_groups = [{
						quantity: 1,
						product: getValidProduct(),
						amount: test_case.a
					},
					{
						quantity: 1,
						product: getValidProduct(),
						amount: test_case.b
					}
				];

				const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
				let registerController = new RegisterController();

				let result = registerController.calculateAmountFromProductGroups([product_groups]);

				expect(result).to.equal(mathutilities.sum([test_case.a, test_case.b]));

			});

		});

	});

});
