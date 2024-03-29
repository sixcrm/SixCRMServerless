
const _ = require('lodash');
const uuidV4 = require('uuid/v4');
const checksum = require('checksum');
const creditcardgenerator = require('creditcard-generator');
const creditCardType = require('credit-card-type');

const randomutilities = require('@6crm/sixcrmcore/lib/util/random').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const hashutilities = require('@6crm/sixcrmcore/lib/util/hash-utilities').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const spoofer = global.SixCRM.routes.include('test', 'spoofer.js');

class MockEntities {

	static getValidStates({ids, entity, state_name}){

		ids = (_.isUndefined(ids) || _.isNull(ids))?this.arrayOfIds():ids;

		return arrayutilities.map(ids, id => {
			return this.getValidState({id: id, entity: entity, state_name: state_name});
		});

	}

	static getValidState({id, entity = null, state_name = null}){

		entity = (_.isNull(entity))?this.getValidId(id):entity;
		state_name = (_.isNull(state_name))?randomutilities.selectRandomFromArray(['Closesession','Createrebill','Billing','Recovery','Prefulfillment','Fulfillment','Postfulfillment','Tracking']):state_name;
		let step = 'Start';
		let execution = hashutilities.toSHA1(randomutilities.createRandomString(20));
		let a_iso8601 = timestamp.getISO8601();

		return {
		  account: this.getTestAccountID(),
		  created_at: a_iso8601,
		  entity: entity,
		  execution: execution,
		  id: this.getValidId(id),
		  name: state_name,
		  step: step,
		  updated_at: a_iso8601
		};

	}

	static getValidFeatureFlag() {

		return {
			environment: 'default',
			updated_at: '2018-05-29T21:39:57.496Z',
			account: 'default',
			created_at: '2018-05-29T21:39:57.495Z',
			features: {
				'cycle-reports': {
					name: 'Cycle Reports',
					description: 'Cycle Reports',
					features: {
						cycle: {
							name: 'Cycle Report',
							description: 'The Cycle Report',
							default: false
						},
						'day-to-day': {
							name: 'Day to Day report',
							description: 'The Day-To-Day report',
							default: false
						}
					},
					default: false
				},
				orders: {
					name: 'Orders',
					description: 'The Orders Side-Nav Submenu',
					features: {
						'pending-rebills': {
							name: 'Pending Rebills',
							description: 'A list of pending rebills for the account',
							default: false
						}
					},
					default: true
				},
				'state-machine': {
					name: 'Order Engine',
					description: 'Order Engine Dashboard',
					default: false
				},
				'crm-setup': {
					name: 'CRM Setup',
					description: 'The CRM Setup Side-Nav Submenu',
					features: {
						'event-hooks': {
							name: 'Event Hooks',
							description: 'The event hooks views',
							default: false
						}
					},
					default: true
				},
				'account-management': {
					name: 'Account Management',
					description: 'The Account Management Side-Nav Submenu',
					default: false
				}
			}
		};

	}

	static getValidTag(id){

		let a_iso8601 = timestamp.getISO8601();

		return {
			id: this.getValidId(id),
			entity:this.getValidId(),
			account:this.getTestAccountID(),
			key: randomutilities.createRandomString(8),
			value: randomutilities.createRandomString(8),
			created_at: a_iso8601,
			updated_at: a_iso8601,
		};

	}

	static getValidOrder(){

		let customer = this.getValidCustomer();
		delete customer.account;
		delete customer.credit_cards;

		let session = this.getValidSession();
		delete session.account;
		session.customer = customer.id;

		let rebill = this.getValidRebill();
		rebill.parentsession =  session.id

		let product = this.getValidProduct();
		delete product.id;
		delete product.default_price;

		let product_group = {
			product: product,
			quantity: randomutilities.randomInt(1,10),
			amount: randomutilities.randomDouble(1.00, 100.00)
		}

		return {
			id: rebill.alias,
			session: session,
			customer: customer,
			products: [product_group],
			amount: rebill.amount,
			date: rebill.created_at
		};

	}
	static getValidInvite(){

		let firstname = spoofer.createRandomName('first');
		let lastname = spoofer.createRandomName('last');
		let email1 = firstname + '.' + lastname + '@' + spoofer.createDomainName();

		firstname = spoofer.createRandomName('first');
		lastname = spoofer.createRandomName('last');
		let email2 = firstname + '.' + lastname + '@' + spoofer.createDomainName();

		let a_iso8601 = timestamp.getISO8601();

		return {
			id: this.getValidId(),
			hash: randomutilities.createRandomString(8),
			email: email1,
			acl: this.getValidId(),
			invitor: email2,
			account: this.getTestAccountID(),
			account_name: "Some Account Name",
			role: this.getValidId(),
			created_at: a_iso8601,
			updated_at: a_iso8601,
		};

	}

	static getValidReturn(id){

		let a_iso8601 = timestamp.getISO8601();

		return {
			id: this.getValidId(id),
			created_at: a_iso8601,
			updated_at: a_iso8601,
			transactions:[
				{
					transaction:this.getValidId(),
					products:[
						{
							product:this.getValidId(),
							alias: randomutilities.createRandomString(15),
							quantity: randomutilities.randomInt(1,5),
							history:[
								{
									state: 'created',
									created_at: a_iso8601
								}
							]
						}
					]
				}
			],
			history:[
				{
					state:'created',
					created_at: a_iso8601
				}
			]
		};

	}

	static getValidNotificationSettings(id) {

		id = (_.isUndefined(id) || _.isNull(id)) ? spoofer.createRandomEmail() : id;

		let a_iso8601 = timestamp.getISO8601();

		return {
			id: id,
			created_at: a_iso8601,
			updated_at: a_iso8601,
			settings: {
				notification_groups: [{
					key: "account",
					display: true,
					default: ['all'],
					notifications: [{
						key: 'a_type_of_notification',
						active: true,
						channels: []
					}]
				}]
			}
		};

	}

	static getValidUserSetting(id) {

		id = (_.isUndefined(id) || _.isNull(id)) ? spoofer.createRandomEmail() : id;

		let a_iso8601 = timestamp.getISO8601();

		return {
			id: id,
			created_at: a_iso8601,
			updated_at: a_iso8601,
			notifications: [{
				name: "six",
				receive: true
			},
			{
				name: "email",
				receive: false
			},
			{
				name: "sms",
				receive: false
			},
			{
				name: "slack",
				receive: false
			},
			{
				name: "skype",
				receive: false
			},
			{
				name: "ios",
				receive: false
			}
			]
		};

	}

	static getValidSNSMessage(message) {

		let default_message = {
			event_type: this.getValidEventType(),
			account: this.getTestAccountID(),
			user: "system@sixcrm.com",
			context: {
				test: "this is a test"
			}
		};

		message = (!_.isUndefined(message) && !_.isNull(message)) ? message : default_message;

		return {
			Records: [{
				EventSource: 'aws:sns',
				EventVersion: '1.0',
				EventSubscriptionArn: 'arn:aws:sns:us-east-1:068070110666:events:97b9686e-e835-4243-b453-1f80b39cb3bd',
				Sns: {
					Type: 'Notification',
					MessageId: '71890333-00d2-5e4f-b9df-5036a0f6243a',
					TopicArn: 'arn:aws:sns:us-east-1:068070110666:events',
					Subject: null,
					Message: JSON.stringify(message),
					Timestamp: '2018-02-20T04:02:44.700Z',
					SignatureVersion: '1',
					Signature: 'IYaZ94s2hsjBXJ8E9eiXqLgXHXC/wqSQq2mTAAKeOY1kWXgr+28bC8t8oxEe2RZifk5cfN840vVEJFpc+fme6p4GyRZcIz99QrRkGAF6EwDxUyojl4FSvZEeX4BWJtMEQY0z0ORadMKoR5+T/gQ9m++k4DnfW9BeZvLK90ogA3fhN6mqFOUv/tKSkt3a9s4J173wikjr4qQwl9njzmJ5/rTqIu3Nezw0PhbZwg6N9d/L80+KN/a3yQ+4gaD/yrAFYddUwt4ZZ7hObh6XtPZufexWlVjxoy21FSqYvtUxPoIKLF/5sui67OFFL7a/YfL93luBDKY8EDUbQORS6r7XmQ==',
					SigningCertUrl: 'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-433026a4050d206028891664da859041.pem',
					UnsubscribeUrl: 'https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:068070110666:events:97b9686e-e835-4243-b453-1f80b39cb3bd',
					MessageAttributes: {}
				}
			}]
		};

	}

	static arrayOfIds(max) {

		max = (_.isUndefined(max) || _.isNull(max)) ? 10 : max;

		let arraycount = randomutilities.randomInt(2, max);

		let return_array = [];

		for (let i = 0; i < arraycount; i++) {
			return_array.push(uuidV4());
		}

		return return_array;

	}

	static getValidMerchantProviderSummaries(ids) {

		ids = (_.isUndefined(ids) || _.isNull(ids)) ? this.arrayOfIds() : ids;

		return arrayutilities.map(ids, id => {
			return this.getValidMerchantProviderSummary(id);
		});

	}

	static getValidMerchantProviderSummary(id) {

		let a_iso8601 = timestamp.getISO8601();

		return {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			merchant_provider: uuidV4(),
			day: a_iso8601,
			count: randomutilities.randomInt(1, 100),
			type: randomutilities.selectRandomFromArray(['new', 'recurring']),
			total: randomutilities.randomDouble(1.0, 100.00),
			created_at: a_iso8601,
			updated_at: a_iso8601
		};

	}

	static getValidId(id) {
		return (!_.isUndefined(id) && !_.isNull(id)) ? id : uuidV4();
	}

	static getValidCycle() {
		return {
			id: uuidV4(),
			length: { days: 14 },
			position: 1,
			next_position: 1,
			price: 30,
			shipping_price: 0,
			cycle_products: [{
				product: uuidV4(),
				is_shipping: true,
				position: 1,
				quantity: 1
			}]
		}
	}

	static getValidProductScheduleGroups(ids, expanded) {

		expanded = (_.isUndefined(expanded) || _.isNull(expanded)) ? false : expanded;

		let product_schedules = this.getValidProductSchedules(ids);

		return arrayutilities.map(product_schedules, product_schedule => {
			return {
				quantity: randomutilities.randomInt(1, 10),
				product_schedule: (expanded) ? product_schedule : product_schedule.id
			}
		});

	}

	static getValidTransactionProducts(ids, expanded) {

		expanded = (_.isUndefined(expanded) || _.isNull(expanded)) ? false : expanded;

		let products = this.getValidProducts(ids);

		return arrayutilities.map(products, product => {
			return {
				quantity: randomutilities.randomInt(1, 10),
				product: (expanded) ? product : product.id,
				amount: randomutilities.randomDouble(1.00, 100.00)
			}
		});

	}

	static getValidProductSchedules(ids, expanded) {

		expanded = (_.isUndefined(expanded) || _.isNull(expanded)) ? false : expanded;

		ids = (_.isUndefined(ids) || _.isNull(ids)) ? [uuidV4(), uuidV4(), uuidV4(), uuidV4()] : ids;

		return arrayutilities.map(ids, (id) => {
			return this.getValidProductSchedule(id, expanded);
		});

	}

	static getValidProducts(ids) {

		ids = (_.isUndefined(ids) || _.isNull(ids)) ? [uuidV4(), uuidV4(), uuidV4(), uuidV4()] : ids;

		return arrayutilities.map(ids, (id) => {
			return this.getValidProduct(id);
		});

	}

	static getValidProductSchedule(id) {

		let cycles = [this.getValidCycle()];

		return {
			id: this.getValidId(id),
			name: randomutilities.createRandomString(20),
			account: this.getTestAccountID(),
			merchantprovidergroup: uuidV4(),
			cycles: cycles,
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		};

	}

	static getValidMessage(id) {

		return {
			MessageId: "someMessageID",
			ReceiptHandle: "SomeReceiptHandle",
			Body: JSON.stringify({
				id: this.getValidId(id)
			}),
			MD5OfBody: "SomeMD5"
		};

	}

	static getValidMerchantProviderGateway(processor) {

		processor = (_.isUndefined(processor) || _.isNull(processor)) ? 'NMI' : processor;

		let gateways = {
			'NMI': {
				type:"NMI",
				name: "NMI",
				username: randomutilities.createRandomString(20),
				password: randomutilities.createRandomString(20),
				processor_id: randomutilities.randomInt(1, 100).toString()
			},
			'Innovio': {
				name: 'Innovio',
				type:'Innovio',
				username: randomutilities.createRandomString(20),
				password: randomutilities.createRandomString(20),
				site_id: '0',
				merchant_account_id: '100',
				product_id: '1001'
			},
			'Test': {
				name: 'Test',
				type: 'Test',
				username: 'demo',
				password: 'password',
				processor_id: '0'
			},
			'Stripe': {
				type: 'Stripe',
				name: 'Stripe',
				api_key: randomutilities.createRandomString(20)
			},
			'AuthorizeNet': {
				type: 'AuthorizeNet',
				name: 'AuthorizeNet',
				api_key: randomutilities.createRandomString(20),
				transaction_key: randomutilities.createRandomString(20)
			},
			'PaymentXP': {
				type: 'PaymentXP',
				name: 'PaymentXP',
				username: randomutilities.createRandomString(20),
				password: randomutilities.createRandomString(20)
			}
		};

		return gateways[processor];

	}

	static getValidMerchantProviderProcessor(processor) {

		processor = (_.isUndefined(processor) || _.isNull(processor)) ? 'NMI' : processor;

		let processors = {
			'NMI': {
				name: 'NMA',
				id: 'deprecated?'
			},
			'Innovio': {
				name: 'Humbolt',
				id: 'deprecated?'
			},
			'Test': {
				name: 'Test',
				id: 'deprecated?'
			},
			'Stripe': {
				name: 'Stripe',
				id: 'deprecated?'
			},
			'AuthorizeNet': {
				name: 'AuthorizeNet'
			},
			'PaymentXP': {
				name: 'PaymentXP'
			}
		};

		return processors[processor];

	}

	static getValidMerchantProviderGroups(ids) {

		ids = (_.isUndefined(ids) || _.isNull(ids)) ? [uuidV4()] : ids;

		let return_object = {};

		arrayutilities.map(ids, id => {
			return_object[id] = this.getValidTransactionProducts();
		});

		return return_object;

	}

	static getValidMerchantProvider(id, processor) {

		return {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			name: randomutilities.createRandomString(20),
			processor: this.getValidMerchantProviderProcessor(processor),
			processing: {
				monthly_cap: 50000.00,
				discount_rate: 0.9,
				transaction_fee: 0.06,
				reserve_rate: 0.5,
				maximum_chargeback_ratio: 0.17
			},
			enabled: true,
			gateway: this.getValidMerchantProviderGateway(processor),
			allow_prepaid: true,
			accepted_payment_methods: ["Visa", "Mastercard", "American Express"],
			customer_service: {
				email: "customer.service@mid.com",
				url: "http://mid.com",
				description: randomutilities.createRandomString(20)
			},
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		};

	}

	static getValidAccessKey(id) {

		return {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			name: randomutilities.createRandomString(10),
			notes: 'This is a mock access key.',
			access_key: this.getValidAccessKeyString(),
			secret_key: this.getValidSecretKeyString(),
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		}

	}

	static getValidAccessKeyString() {

		let accessKeyHelperController = global.SixCRM.routes.include('helpers', 'accesskey/AccessKey.js');

		return accessKeyHelperController.generateAccessKey();

	}

	static getValidSecretKeyString() {

		let accessKeyHelperController = global.SixCRM.routes.include('helpers', 'accesskey/AccessKey.js');

		return accessKeyHelperController.generateSecretKey();

	}

	static getValidTrackingNumber(vendor) {

		let vendor_tracking_numbers = {
			'Test': () => randomutilities.createRandomString(20)
		}

		return vendor_tracking_numbers[vendor]();

	}

	static getValidTransactionProduct(id, extended) {

		extended = (_.isUndefined(extended) || _.isNull(extended)) ? false : extended;
		let product = (extended) ? this.getValidProduct(id) : this.getValidId(id);

		return {
			product: product,
			amount: randomutilities.randomDouble(1.0, 300.0, 2),
			quantity: 1
		};

	}

	static getValidCustomer(id) {

		let firstname = spoofer.createRandomName('first');
		let lastname = spoofer.createRandomName('last');
		let email = firstname + '.' + lastname + '@' + spoofer.createDomainName();

		let customer = {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			email: email,
			firstname: firstname,
			lastname: lastname,
			phone: spoofer.createRandomPhoneNumber(),
			address: {
				line1: spoofer.createRandomAddress('line1'),
				city: spoofer.createRandomAddress('city'),
				state: spoofer.createRandomAddress('state'),
				zip: spoofer.createRandomAddress('zip'),
				country: spoofer.createRandomAddress('country')
			},
			creditcards: [uuidV4()],
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		}

		if (randomutilities.randomBoolean()) {
			customer.address.line2 = spoofer.createRandomAddress('line2');
		}

		return customer;

	}

	static getValidTrialConfirmation(id) {

		let trialConfirmation = {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			sms_provider: uuidV4()
		};

		return trialConfirmation;
	}

	static getValidProduct(id) {

		return {
			id: this.getValidId(id),
			name: randomutilities.createRandomString(20),
			sku: randomutilities.createRandomString(20),
			is_shippable: randomutilities.randomBoolean(),
			shipping_delay: randomutilities.randomInt(60, 9999999),
			fulfillment_provider: uuidV4(),
			price: randomutilities.randomDouble(1.0, 300.0, 2),
			image_urls: [
			  spoofer.createURL()
			],
			account_id: this.getTestAccountID(),
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		};

	}


	static getTestAccountID() {
		return "d3fa3bf3-7824-49f4-8261-87674482bf1c";
	}

	static getValidFulfillmentProviderProvider(type) {

		let providers = {
			Hashtag: {
				name: 'Hashtag',
				username: randomutilities.createRandomString(20),
				password: randomutilities.createRandomString(20),
				threepl_customer_id: randomutilities.randomInt(),
				threepl_key: '{' + uuidV4() + '}'
			},
			ThreePL: {
				name: 'ThreePL',
				username: randomutilities.createRandomString(20),
				password: randomutilities.createRandomString(20),
				threepl_customer_id: randomutilities.randomInt(),
				threepl_key: '{' + uuidV4() + '}',
				threepl_id: randomutilities.randomInt(),
				threepl_facility_id: randomutilities.randomInt()
			},
			Test: {
				name: 'Test'
			},
			ShipStation: {
				name: 'ShipStation',
				api_key: randomutilities.createRandomString(20),
				api_secret: randomutilities.createRandomString(20)
			}
		};

		return providers[type];

	}

	static getValidFulfillmentProvider(id, type) {

		type = (_.isUndefined(type) || !_.includes(['ShipStation', 'Hashtag', 'ThreePL', 'Test'], type)) ? 'Hashtag' : type;

		let provider = this.getValidFulfillmentProviderProvider(type);

		return {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			name: randomutilities.createRandomString(20),
			provider: provider,
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		};

	}

	static getValidHistoryElement() {

		let random_status = ['unknown', 'intransit', 'delivered', 'returned'];

		return {
			created_at: timestamp.getISO8601(),
			status: randomutilities.selectRandomFromArray(random_status),
			detail: randomutilities.createRandomString(20)
		}
	}

	static getValidShippingReceipt(id) {

		return {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			tracking: {
				carrier: 'UPS',
				id: randomutilities.createRandomString(10)
			},
			history: [this.getValidHistoryElement()],
			status: "intransit",
			fulfillment_provider: uuidV4(),
			fulfillment_provider_reference: uuidV4().slice(0, 8),
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		};

	}

	static getValidTransactions(ids) {

		ids = (_.isUndefined(ids) || _.isNull(ids)) ? [uuidV4(), uuidV4(), uuidV4(), uuidV4()] : ids;

		return arrayutilities.map(ids, (id) => {
			return this.getValidTransaction(id);
		});

	}

	static getValidTransaction(id) {

		return {
			id: this.getValidId(id),
			amount: 14.99,
			alias: "T" + randomutilities.createRandomString(9),
			account: this.getTestAccountID(),
			rebill: uuidV4(),
			processor_response: "{\"message\":\"Success\",\"result\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894419\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
			merchant_provider: uuidV4(),
			products: this.getValidTransactionProducts(null, true),
			type: "sale",
			result: "success",
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		};

	}

	static getValidRebills(ids) {

		ids = (_.isUndefined(ids) || _.isNull(ids))?this.arrayOfIds():ids;

		return arrayutilities.map(ids, id => {
			return this.getValidRebill(id);
		});

	}

	static getValidRebill(id) {

		return {
			bill_at: timestamp.getISO8601(),
			id: this.getValidId(id),
			alias: 'R'+randomutilities.createRandomString(9),
			account: this.getTestAccountID(),
			parentsession: uuidV4(),
			product_schedules: [uuidV4()],
			products: this.getValidTransactionProducts(null, true),
			amount: randomutilities.randomDouble(1, 200, 2),
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		};

	}

	static getValidSessionAlias() {
		return 'S' + randomutilities.createRandomString(9);
	}

	static getValidAffiliates() {

		return {
			affiliate: randomutilities.createRandomString(randomutilities.randomInt(5, 40)),
			subaffiliate_1: randomutilities.createRandomString(randomutilities.randomInt(5, 40)),
			subaffiliate_2: randomutilities.createRandomString(randomutilities.randomInt(5, 40)),
			subaffiliate_3: randomutilities.createRandomString(randomutilities.randomInt(5, 40)),
			subaffiliate_4: randomutilities.createRandomString(randomutilities.randomInt(5, 40)),
			subaffiliate_5: randomutilities.createRandomString(randomutilities.randomInt(5, 40)),
		};

	}

	static getValidSession(id) {

		let product_schedules = this.getValidProductSchedules();

		return {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			alias: this.getValidSessionAlias(),
			customer: uuidV4(),
			campaign: uuidV4(),
			product_schedules: arrayutilities.map(product_schedules, (product_schedule) => product_schedule.id),
			watermark: this.getValidWatermark(product_schedules),
			completed: true,
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601(),
			affiliate: uuidV4(),
			subaffiliate_1: uuidV4(),
			subaffiliate_2: uuidV4(),
			subaffiliate_3: uuidV4(),
			subaffiliate_4: uuidV4(),
			subaffiliate_5: uuidV4(),
			cid: uuidV4()
		};

	}

	static getValidWatermark(product_schedules, products) {

		let return_object = {};

		if (arrayutilities.nonEmpty(product_schedules)) {

			return_object.product_schedules = arrayutilities.map(product_schedules, product_schedule => {
				return this.getValidProductScheduleGroup(product_schedule);
			});

		}

		if (arrayutilities.nonEmpty(products)) {

			return_object.products = arrayutilities.map(products, product => {
				return this.getValidProductGroup(product);
			});

		}

		return return_object;

	}

	static getValidProductScheduleGroup(product_schedule, quantity) {

		product_schedule = (_.isUndefined(product_schedule) || _.isNull(product_schedule)) ? this.getValidProductSchedule() : product_schedule;
		quantity = (_.isUndefined(quantity) || _.isNull(quantity)) ? randomutilities.randomInt(1, 10) : quantity;

		return {
			product_schedule: product_schedule,
			quantity: quantity
		};

	}

	static getValidProductGroup(product, quantity, price) {

		product = (_.isUndefined(product) || _.isNull(product)) ? this.getValidProduct() : product;
		price = (_.isUndefined(price) || _.isNull(price)) ? randomutilities.randomDouble(1.0, 100.00) : price;
		quantity = (_.isUndefined(quantity) || _.isNull(quantity)) ? randomutilities.randomInt(1, 10) : quantity;

		return {
			product: product,
			quantity: quantity,
			price: price
		};

	}

	static getValidTransactionCustomer() {

		let phone = spoofer.createRandomPhoneNumber();
		let firstname = spoofer.createRandomName('first');
		let lastname = spoofer.createRandomName('last');
		let email = firstname + '.' + lastname + '@' + spoofer.createDomainName();
		let address = this.getValidAddress();

		return {
			email: email,
			firstname: firstname,
			lastname: lastname,
			phone: phone,
			address: address,
			billing: address
		};

	}

	static getValidAddress() {

		let address = {
			line1: spoofer.createRandomAddress('line1'),
			city: spoofer.createRandomAddress('city'),
			state: spoofer.createRandomAddress('state'),
			zip: spoofer.createRandomAddress('zip'),
			//country:spoofer.createRandomAddress('country')
			country: 'US'
		};

		if (randomutilities.randomBoolean()) {
			address.line2 = spoofer.createRandomAddress('line2');
		}

		return address;

	}

	static getValidCreditCardProperties() {

		return {
			binnumber: 411111,
			brand: 'Visa',
			bank: 'Some Bank',
			type: 'Classic',
			level: 'level',
			country: 'US',
			info: '',
			country_iso: 'USA',
			country2_iso: 'USA',
			country3_iso: 'USA',
			webpage: 'www.bankofamerica.com',
			phone: '15032423612'
		};

	}

	static getValidTransactionCreditCard(name, address, type) {

		let creditcard_types = ['VISA', 'Amex', 'Mastercard'];

		type = (!_.isUndefined(type) && !_.isNull(type) && _.includes(creditcard_types, type)) ? type : randomutilities.selectRandomFromArray(creditcard_types);

		name = (!_.isUndefined(name) && !_.isNull(name)) ? name : spoofer.createRandomName('full');

		address = (!_.isUndefined(address) && !_.isNull(address)) ? address : this.getValidAddress();

		return {
			name: name,
			number: this.getValidCreditCardNumber(type),
			expiration: this.getValidCreditCardExpiration(),
			cvv: this.getValidCreditCardCVV(type),
			address: address
		};

	}

	static getValidCreditCardNumber(type) {
		let creditcard_types = ['VISA', 'Amex', 'Mastercard'];

		type = (!_.isUndefined(type) && !_.isNull(type) && _.includes(creditcard_types, type)) ? type : randomutilities.selectRandomFromArray(creditcard_types);

		return creditcardgenerator.GenCC(type).shift();

	}

	static getValidCreditCardExpiration() {
		let expiration_month = randomutilities.randomInt(1, 12).toString();

		if (expiration_month.length == 1) {
			expiration_month = '0' + expiration_month;
		}

		let current_year = parseInt(timestamp.getYear())+1;

		let expiration_year = randomutilities.randomInt(current_year, (current_year + randomutilities.randomInt(1, 5))).toString();

		return expiration_month + '/' + expiration_year;

	}

	static getValidCreditCardCVV(type) {
		let creditcard_types = ['VISA', 'Amex', 'Mastercard'];

		type = (!_.isUndefined(type) && !_.isNull(type) && _.includes(creditcard_types, type)) ? type : randomutilities.selectRandomFromArray(creditcard_types);

		if (type == 'Amex') {

			return randomutilities.randomInt(1001, 9999).toString();

		}

		return randomutilities.randomInt(111, 999).toString();

	}

	static getValidCreditCard(id){
		return this.getValidPlaintextCreditCard(id);

		//card.number = encryptionutilities.encryptAES256(card.id, card.number);
		//card.cvv = encryptionutilities.encryptAES256(card.id, card.cvv);
		//return card;
	}

	static getValidPlaintextCreditCard(id) {
		const number = this.getValidCreditCardNumber();
		const last_four = number.slice(-4);
		const first_six = number.slice(0, 6);
		const type = (creditCardType(first_six))[0].niceType;
		const expiration = this.getValidCreditCardExpiration();
		const normalized_expiration = `${expiration.slice(0,2)}/${expiration.slice(-2)}`;
		const card_checksum = checksum(`${first_six}.${last_four}.${normalized_expiration}`);

		return {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			customers: [uuidV4()],
			address: this.getValidAddress(),
			token: this.getValidCreditCardToken(),
			first_six: first_six,
			last_four: last_four,
			type: type,
			expiration,
			checksum: card_checksum,
			name: spoofer.createRandomName('full'),
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		};
	}

	static getValidCreditCardToken(){

		return {
			provider:"tokenex",
			token:"sometokenstring"
		};

	}

	static getValidAccountDetails() {
		return {
			id: this.getValidId()
		}
	}

	static getValidCustomerNotes(id) {

		return {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			customer: uuidV4(),
			user: spoofer.createRandomEmail(),
			body: randomutilities.createRandomString(20),
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		}
	}
	/* eslint-disable */

  static getValidMerchantProviderConfiguration(ids) {

    ids = (_.isUndefined(ids) || _.isNull(ids)) ? [uuidV4(), uuidV4()] : ids;

    return arrayutilities.map(ids, id => {
      return {
        id: uuidV4(),
        distribution: randomutilities.randomDouble(0.0, 1.0)
      };
    });
    /* eslint-enable */

	}

	static getValidMerchantProviderGroup(id, merchant_provider_configuration) {

		merchant_provider_configuration = (_.isUndefined(merchant_provider_configuration) || _.isNull(merchant_provider_configuration)) ? this.getValidMerchantProviderConfiguration() : merchant_provider_configuration;

		return {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			name: spoofer.createRandomName('full'),
			merchantproviders: merchant_provider_configuration,
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		};

	}

	static getValidNotification(id) {

		return {
			id: this.getValidId(id),
			user: spoofer.createRandomEmail(),
			action: randomutilities.createRandomString(10),
			account: this.getTestAccountID(),
			title: randomutilities.createRandomString(10),
			type: randomutilities.createRandomString(10),
			category: randomutilities.createRandomString(10),
			body: randomutilities.createRandomString(20),
			expires_at: timestamp.getISO8601(),
			read_at: timestamp.getISO8601(),
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		}
	}

	static getValidUserSigningString(id) {

		return {
			id: this.getValidId(id),
			user: spoofer.createRandomEmail(),
			name: spoofer.createRandomName('full'),
			signing_string: randomutilities.createRandomString(20),
			used_at: timestamp.getISO8601(),
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		}
	}

	static getValidUser(id) {

		id = (_.isUndefined(id) || _.isNull(id)) ? spoofer.createRandomEmail() : id;

		return {
			id: id.toLowerCase(),
			name: spoofer.createRandomName('full'),
			first_name: spoofer.createRandomName('first'),
			last_name: spoofer.createRandomName('last'),
			auth0_id: randomutilities.createRandomString(10),
			active: randomutilities.randomBoolean(),
			termsandconditions: randomutilities.createRandomString(10),
			alias: randomutilities.createRandomString(40),
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601(),
			acl: [{
				account: {
					id: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'
				},
				role: {
					permissions: {
						allow: ['*/*'],
						deny: []
					}
				}
			}],
		}
	}

	static getValidUserACL(id) {

		return {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			user: spoofer.createRandomEmail(),
			role: uuidV4(),
			pending: randomutilities.createRandomString(10),
			termsandconditions: randomutilities.createRandomString(10),
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		}
	}

	static getValidAffiliate(id) {

		return {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			name: spoofer.createRandomName('full'),
			affiliate_id: randomutilities.createRandomString(10),
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		}
	}

	static getValidAccount(id) {

		return {
			id: this.getValidId(id),
			name: spoofer.createRandomName('full'),
			billing:{
				plan: 'free'
			},
			active: randomutilities.randomBoolean(),
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		}
	}

	static getValidRole(id) {

		return {
			id: this.getValidId(id),
			name: spoofer.createRandomName('full'),
			active: randomutilities.randomBoolean(),
			permissions: {
				allow: [
					randomutilities.createRandomString(10)
				],
				deny: [
					randomutilities.createRandomString(10)
				]
			},
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		}
	}

	static getDisabledRole() {

		return {
			"id":"78e507dd-93fc-413b-b21a-819480209740",
			"account": "*",
			"name": "Disabled Role",
			"active":true,
			"permissions":{
				"allow":[
					"account/*",
					"bill/*",
					"customer/*",
					"session/*",
					"creditcard/*",
					"customernote/*",
					"rebill/*",
					"return/*",
					"shippingreceipt/*",
					"transaction/*"
				],
				"deny":["*"]
			},
			"created_at":"2017-04-06T18:40:41.405Z",
			"updated_at":"2017-04-06T18:41:12.521Z"
		};

	}

	static getValidBill(id) {

		return {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			paid: randomutilities.randomBoolean(),
			paid_result: randomutilities.createRandomString(10),
			outstanding: randomutilities.randomBoolean(),
			period_start_at: timestamp.getISO8601(),
			period_end_at: timestamp.getISO8601(),
			available_at: timestamp.getISO8601(),
			detail: [{
				created_at: timestamp.getISO8601(),
				description: randomutilities.createRandomString(10),
				amount: randomutilities.randomDouble(1, 200, 2)
			}],
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		}
	}

	static getValidCampaign(id) {

		return {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			allow_on_order_form: randomutilities.randomBoolean(),
			allow_prepaid: randomutilities.randomBoolean(),
			show_prepaid: randomutilities.randomBoolean(),
			name: spoofer.createRandomName('full'),
			emailtemplates: [uuidV4()],
			affiliate_allow: [uuidV4()],
			affiliate_deny: [uuidV4()],
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		};

	}

	static getValidTrackers(ids) {

		ids = (_.isUndefined(ids) || _.isNull(ids)) ? [uuidV4(), uuidV4()] : ids;

		return arrayutilities.map(ids, id => {
			return this.getValidTracker(id);
		});

	}

	static getValidTracker(id) {

		let tracker_types = ["postback", "html"];

		let event_type = ["click", "lead", "main", "upsell", "confirm"];

		return {
			id: this.getValidId(id),
			affiliates: [uuidV4()],
			campaigns: [uuidV4()],
			account: this.getTestAccountID(),
			type: randomutilities.selectRandomFromArray(tracker_types),
			event_type: [
				randomutilities.selectRandomFromArray(event_type)
			],
			name: spoofer.createRandomName('full'),
			body: randomutilities.createRandomString(20),
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		};

	}

	static getValidSMTPProvider(id) {

		let random_hostname = randomutilities.createRandomString(5) + '.' + spoofer.createDomainName();

		return {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			name: randomutilities.createRandomString(10),
			hostname: random_hostname,
			username: randomutilities.createRandomString(10),
			password: randomutilities.createRandomString(10),
			port: randomutilities.randomInt(100, 999),
			from_email: spoofer.createRandomEmail(),
			from_name: spoofer.createRandomName('full'),
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		}
	}

	static getValidEmailTemplates(ids, event_type) {

		ids = (!_.isUndefined(ids) && !_.isNull(ids)) ? ids : this.arrayOfIds();

		return arrayutilities.map(ids, id => {
			return this.getValidEmailTemplate(id, event_type);
		});

	}

	static getValidEmailTemplate(id, event_type) {

		return {
			id: this.getValidId(id),
			account: this.getTestAccountID(),
			name: randomutilities.createRandomString(20),
			body: randomutilities.createRandomString(20),
			subject: randomutilities.createRandomString(10),
			type: this.getValidEventType(event_type),
			smtp_provider: uuidV4(),
			created_at: timestamp.getISO8601(),
			updated_at: timestamp.getISO8601()
		}
	}

	static getValidEventType(event_type) {

		if (!_.isUndefined(event_type)) {

			let validates = global.SixCRM.validate(event_type, global.SixCRM.routes.path('model', 'definitions/eventtype.json'), false);

			if (validates) {
				return event_type;
			}

		}

		return randomutilities.selectRandomFromArray(['click', 'lead', 'order', 'confirm']);

	}

	static getValidProcessorResponse() {
		return {
			code: 'success',
			result: {
				message: "Success",
				result: {
					response: "1",
					responsetext: "SUCCESS",
					authcode: "123456",
					transactionid: "3448894418",
					avsresponse: "N",
					cvvresponse: "",
					orderid: "",
					type: "sale",
					response_code: "100"
				}
			},
			merchant_code: "200",
			merchant_message: "OK",
			message: 'Some message'
		}
	}

	static getValidTransactionPrototype() {

		let type = ["sale", "refund", "reverse"];

		return {
			rebill: this.getValidRebill(),
			amount: randomutilities.randomDouble(1, 200, 2),
			type: randomutilities.selectRandomFromArray(type),
			result: 'success',
			processor_response: this.getValidProcessorResponse(),
			merchant_provider: uuidV4(),
			products: this.getValidTransactionProducts(null, true)
		};
	}

	static getValidTransformedTransactionPrototype() {

		let type = ["sale", "refund", "reverse"];

		return {
			rebill: uuidV4(),
			processor_response: JSON.stringify(this.getValidProcessorResponse()),
			amount: randomutilities.randomDouble(1, 200, 2),
			products: this.getValidTransactionProducts(null, true),
			alias: "T" + randomutilities.createRandomString(9),
			merchant_provider: uuidV4(),
			type: randomutilities.selectRandomFromArray(type),
			result: 'success'
		}

	}

}

module.exports = MockEntities;
