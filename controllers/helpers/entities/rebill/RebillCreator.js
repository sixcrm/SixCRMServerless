
const _ = require('lodash');
const moment = require('moment');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const numberutilities = require('@6crm/sixcrmcore/util/number-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const currencyutilities = require('@6crm/sixcrmcore/util/currency-utilities').default;

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const RebillHelperUtilities = global.SixCRM.routes.include('helpers', 'entities/rebill/components/RebillHelperUtilities.js');
const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
const SessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');
const sessionController = new SessionController();

module.exports = class RebillCreatorHelper extends RebillHelperUtilities {

	//Need cases:  Transactional Endpoint:
	/*
    It's the first moment after someone has agreed to a session productschedule and I'm trying to bill them
    but I need a rebill in the database first
     - createRebill(session, 0)
     --note that this creates all rebills for the session, optionally add a product_schedule?
    The session has come through the createRebillQueue and I need to create the next rebills for the session
     - createRebill(session)
  */

	constructor(){

		super();

		this.parameter_definition = {
			createRebill: {
				required:{
					session:'session'
				},
				optional:{
					day:'day',
					//Technical Debt:  Why are these here?
					productschedules: 'product_schedules',
					products: 'products'
				}
			}
		};

		this.parameter_validation = {
			'session': global.SixCRM.routes.path('model','entities/session.json'),
			'day': global.SixCRM.routes.path('model','helpers/rebill/day.json'),
			'billdate':global.SixCRM.routes.path('model', 'definitions/iso8601.json'),
			'nextproductschedulebilldaynumber': global.SixCRM.routes.path('model','helpers/rebill/day.json'),
			'productschedules': global.SixCRM.routes.path('model','helpers/rebill/productschedules.json'),
			'products': global.SixCRM.routes.path('model','helpers/rebill/products.json'),
			'normalizedproductschedules':global.SixCRM.routes.path('model','helpers/rebill/normalizedproductschedules.json'),
			'normalizedproducts':global.SixCRM.routes.path('model','helpers/rebill/normalizedproducts.json'),
			'scheduleelementsonbillday':global.SixCRM.routes.path('model', 'helpers/rebill/scheduledproducts.json'),
			'transactionproducts': global.SixCRM.routes.path('model', 'helpers/rebill/transactionproducts.json'),
			'transactionproduct': global.SixCRM.routes.path('model', 'entities/components/transactionproduct.json'),
			'amount': global.SixCRM.routes.path('model','definitions/currency.json'),
			'rebillprototype': global.SixCRM.routes.path('model', 'helpers/rebill/rebillprototype.json'),
			'rebill': global.SixCRM.routes.path('model', 'entities/rebill.json')
		};

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

		const ProductScheduleHelperController = global.SixCRM.routes.include('helpers','entities/productschedule/ProductSchedule.js');

		this.productScheduleHelperController = new ProductScheduleHelperController();

	}

	/* Note:  Really, the name of this function should be "createUpcomingRebill"
  If day is -1, the first (initial) element of the product schedule is returned.
  If day is 0, the second element of the product schedule is returned
  In general, this method always returns the next available rebill object from the date that is specified.
  */

	//Technical Debt:  Test this!
	createRebill(){

		du.debug('Create Rebill');

		this.parameters.store = {};

		return this.setParameters({argumentation: arguments[0], action: 'createRebill'})
			.then(() => this.hydrateArguments())
			.then(() => this.normalizeArguments())
			.then(() => this.validateArguments())
			.then(() => this.shouldRebill())
			.then(() => this.acquireRebillProperties())
			.then(() => this.buildRebillPrototype())
			.then(() => this.calculateCycle())
			.then(() => this.pushRebill())
			.then(() => this.returnRebill())
			.catch((error) => {
				if(_.has(error, 'code') && error.code == '520'){
					const message_code = error.message.replace('[520] ','');
					if(_.includes(['CONCLUDE', 'CONCLUDED', 'CANCELLED', 'INCOMPLETE'], error.message.replace('[520] ',''))){
						return message_code;
					}
				}
				throw error;
			});

	}

	setParameters({argumentation, action}){

		du.debug('Set Parameters');

		this.parameters.setParameters({argumentation: argumentation, action: action});

		return Promise.resolve(true);

	}

	hydrateArguments(){

		du.debug('Hydrate Arguments');

		let session = this.parameters.get('session');
		let day = this.parameters.get('day', {fatal: false});
		let products = this.parameters.get('products', {fatal: false});
		let product_schedules = this.parameters.get('productschedules', {fatal: false});

		if(_.isNull(day)){
			this.calculateDayInCycle(session.created_at);
			day = this.parameters.get('day', {fatal: false});
		}

		if(_.isNull(product_schedules)){
			if(day >= 0){
				//we only do this for state-machine billing
				product_schedules = (objectutilities.hasRecursive(session, 'watermark.product_schedules'))?session.watermark.product_schedules:null;
			}
		}

		if(!_.isNull(product_schedules)){
			this.parameters.set('productschedules', product_schedules);
		}

		//Technical Debt:  Double Check this.  It's intended to distinguish between rebills in state machine and rebills for the transactional endpoint
		if(day < 0 && !_.isNull(products)){
			this.parameters.set('products', products);
		}

		if(_.isNull(products) && _.isNull(product_schedules)){
			throw eu.getError('server', 'Nothing to add to the rebill.');
		}

		return true;

	}

	normalizeArguments(){

		du.debug('Normalize Arguments');

		let promises = [
			this.normalizeProductSchedules(),
			this.normalizeProducts()
		];

		return Promise.all(promises).then(() => {
			return true;
		});

	}

	normalizeProductSchedules(){

		du.debug('Normalize Product Schedules');

		let product_schedules = this.parameters.get('productschedules', {fatal: false});

		if(!_.isNull(product_schedules)){

			let normalized_product_schedules = arrayutilities.map(product_schedules, product_schedule_group => {

				if(_.isString(product_schedule_group.product_schedule)){

					return this.productScheduleHelperController.getHydrated({id: product_schedule_group.product_schedule}).then(result => {

						product_schedule_group.product_schedule = result;
						return product_schedule_group;

					});

				}else if(_.isObject(product_schedule_group.product_schedule)){

					return Promise.resolve(product_schedule_group);

				}

			});

			return Promise.all(normalized_product_schedules).then(result => {

				this.parameters.set('normalizedproductschedules', result);
				return true;
			});

		}

		return Promise.resolve(true);

	}

	normalizeProducts(){

		du.debug('Normalize Products');

		let products = this.parameters.get('products', {fatal: false});

		if(!_.isNull(products)){

			if(!_.has(this, 'productController')){
				const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
				this.productController = new ProductController();
			}

			let normalized_products = arrayutilities.map(products, product_group => {

				if(this.productController.isUUID(product_group.product)){

					return this.productController.get({id: product_group.product}).then(result => {
						if(_.isNull(result)){
							throw eu.getError('not_found', 'Product does not exist: '+product_group.product);
						}
						product_group.product = result;
						return product_group;
					});

				}else if(_.isObject(product_group.product)){

					//Watermark/On-Demand Product
					return Promise.resolve(product_group);

				}

			});

			return Promise.all(normalized_products).then(result => {
				this.parameters.set('normalizedproducts', result);
				return true;
			});

		}

		return Promise.resolve(true);

	}

	//Technical Debt:  Review...
	validateArguments(){

		du.debug('Validate Arguments');

		let normalized_product_schedules = this.parameters.get('normalizedproductschedules', {fatal: false});

		if(arrayutilities.nonEmpty(normalized_product_schedules)){
			arrayutilities.map(normalized_product_schedules, normalized_product_schedule => {
				if(!objectutilities.hasRecursive(normalized_product_schedule, 'product_schedule.schedule')){
					throw eu.getError('bad_request','Normalized product schedule is missing product_schedule.schedule element');
				}
				arrayutilities.map(normalized_product_schedule.product_schedule.schedule, schedule_element => {
					if(_.has(schedule_element, 'end') && schedule_element.end <= schedule_element.start){
						throw eu.getError('bad_request','A schedule element end can not be less than or equal to a schedule element start.');
					}
				})
			});
		}
		// let normalized_products = this.parameters.get('normalizedproducts', {fatal: false});
		// let session = this.parameters.get('session');
		// let day = this.parameters.get('day');

		/*
    if(day < 0){
      //In other words, these product schedules may already be in the session?
      du.warning('Creating a rebill object without validating the presence of the product_schedules in the session.');
    }else{
      //Technical Debt:  But, but, but, didn't we get the product schedules from the session?
      arrayutilities.map(product_schedules, (product_schedule) => {
        if(!_.includes(session.product_schedules, product_schedule.id)){
          throw eu.getError('server', 'The specified product schedule is not contained in the session object: '+product_schedule.id);
        }
      });
    }
    */

		this.validateProductPricing();
		this.validateProductSchedulePricing();

		return Promise.resolve(true);

	}

	shouldRebill(){

		du.debug('Should Rebill');

		const session = this.parameters.get('session', {fatal: false});
		const day = this.parameters.get('day', {fatal: false});

		if(_.has(session, 'concluded') && session.concluded == true){
			du.warning('Session concluded, do not rebill');
			throw eu.getError('control', 'CONCLUDED');
		}

		if(_.has(session, 'cancelled') && _.has(session.cancelled, 'cancelled') && session.cancelled.cancelled == true){
			du.warning('Session cancelled, do not rebill');
			throw eu.getError('control', 'CANCELLED');
		}

		if(day < 0){
			return;
		}

		if(!_.has(session, 'completed') || session.completed !== true){
			du.warning('Session is not completed, do not rebill');
			throw eu.getError('control', 'INCOMPLETE');
		}

		const product_schedules = this.parameters.get('normalizedproductschedules', {fatal: false});

		if(!_.isArray(product_schedules) || !arrayutilities.nonEmpty(product_schedules)){
			du.warning('No product schedules, do not rebill');
			throw eu.getError('control', 'CONCLUDE');
		}

	}

	validateProductPricing() {
		if(!_.has(this, 'productController')){
			const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
			this.productController = new ProductController();
		}

		const product_groups = this.parameters.get('normalizedproducts', {fatal: false});
		if (_.isNull(product_groups)) {
			return true;
		}

		const valid = arrayutilities.every(product_groups, product_group => {
			if (!_.has(product_group, 'price')) {
				return true;
			}

			return this.productController.validateDynamicPrice(product_group.product, product_group.price);
		});

		if (!valid) {
			throw eu.getError('bad_request', 'Price must be within product\'s dynamic price range.');
		}

		return valid;
	}

	validateProductSchedulePricing() {
		if(!_.has(this, 'productController')){
			const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
			this.productController = new ProductController();
		}

		const product_schedules = this.parameters.get('normalizedproductschedules', {fatal: false});
		if (_.isNull(product_schedules)) {
			return true;
		}

		const valid = arrayutilities.every(product_schedules, product_schedule => {
			const products = product_schedule.product_schedule.schedule;
			return arrayutilities.every(products, product_group => {
				if (!_.has(product_group, 'price')) {
					return true;
				}

				return this.productController.validateDynamicPrice(product_group.product, product_group.price);
			});
		});

		if (!valid) {
			throw eu.getError('bad_request', 'Price must be within product\'s dynamic price range.');
		}

		return valid;
	}

	//Technical Debt:  Test this!
	acquireRebillProperties(){

		du.debug('Acquire Rebill Properties');

		return this.getNextProductScheduleBillDayNumber()
			.then(() => this.getMerchantProviders())
			.then(() => this.getScheduleElementsOnBillDay())
			.then(() => this.addScheduleElementsToTransactionProducts())
			.then(() => this.addProductsToTransactionProducts())
			.then(() => this.calculateAmount())
			.then(() => this.calculateBillAt());

	}

	//Technical Debt:  For the sale of products, need to account for the case where there are no product schedules...
	getNextProductScheduleBillDayNumber(){

		du.debug('Get Next Product Schedule Schedule Element Start Day Number');

		let day = this.parameters.get('day');
		let normalized_product_schedules = this.parameters.get('normalizedproductschedules', {fatal: false});

		if(!_.isNull(normalized_product_schedules)){

			let start_day_numbers = arrayutilities.map(normalized_product_schedules, product_schedule_group => {
				return this.productScheduleHelperController.getNextScheduleElementStartDayNumber({day: day, product_schedule: product_schedule_group.product_schedule});
			});

			start_day_numbers =  arrayutilities.filter(start_day_numbers, start_day_number => {
				return numberutilities.isInteger(start_day_number);
			});

			let next_schedule_element_start_day_number = arrayutilities.reduce(start_day_numbers, (min, value) => {

				if(!numberutilities.isInteger(min)){
					return value;
				}

				if(value < min){
					return value;
				}

				return min;

			}, null);

			if(!_.isNull(next_schedule_element_start_day_number)){

				this.parameters.set('nextproductschedulebilldaynumber', next_schedule_element_start_day_number);

				return Promise.resolve(true);

			}

		}else{

			//In the case where there are no product schedules, we can assume that this is a straight sale of products.
			//Therefore the day must be -1 and thus we can set the nex product schedule bill day number to 0
			if(day < 0){

				//Technical Debt:  Should we just omit this?
				this.parameters.set('nextproductschedulebilldaynumber', 0);

				return Promise.resolve(true);

			}else{

				throw eu.getError('server', 'Unrecognized case: day is greater than or equal to 0 but there are no normalized product schedules.');

			}

		}

		//Note:  Null means that we don't have any more billings available to this collection of product schedules.
		return Promise.resolve(false);

	}

	async getMerchantProviders() {
		const session = this.parameters.get('session');
		const previous_rebills = await sessionController.listRebills(session);
		if (!_.isArray(previous_rebills) || previous_rebills.length === 0) {
			return;
		}

		const previous_rebills_ordered = _.orderBy(previous_rebills, [rebill => new Date(rebill.bill_at)], ['desc']);
		const last_rebill = previous_rebills_ordered[0];

		this.parameters.set('merchantprovider', last_rebill.merchant_provider);
		this.parameters.set('merchantproviderselections', last_rebill.merchant_provider_selections);
	}

	getScheduleElementsOnBillDay(){

		du.debug('Get Schedule Elements On Bill Day');

		let normalized_product_schedules = this.parameters.get('normalizedproductschedules', {fatal: false});
		let bill_day = this.parameters.get('nextproductschedulebilldaynumber');

		if(_.isNull(normalized_product_schedules)){ return Promise.resolve(true); }

		let schedule_elements = [];

		arrayutilities.map(normalized_product_schedules, normalized_product_schedule => {

			let sub_elements = this.productScheduleHelperController.getScheduleElementsOnDayInSchedule({day: bill_day, product_schedule: normalized_product_schedule.product_schedule})

			if(!_.isNull(sub_elements) && arrayutilities.nonEmpty(sub_elements)){

				arrayutilities.map(sub_elements, sub_element => {
					schedule_elements.push({
						quantity: normalized_product_schedule.quantity,
						schedule_element:sub_element
					});
				});

			}

		});

		schedule_elements = arrayutilities.filter(schedule_elements, (schedule_element) => {
			return objectutilities.isObject(schedule_element.schedule_element);
		});

		if(arrayutilities.nonEmpty(schedule_elements)){

			this.parameters.set('scheduleelementsonbillday', schedule_elements);

			return Promise.resolve(true);

		}

		return Promise.resolve(false);

	}

	addScheduleElementsToTransactionProducts(){

		du.debug('Get Schedule Elements Products');

		let schedule_elements = this.parameters.get('scheduleelementsonbillday', {fatal: false});

		if(arrayutilities.nonEmpty(schedule_elements)){

			arrayutilities.map(schedule_elements, schedule_element => {

				let transaction_product = {
					product: schedule_element.schedule_element.product,
					amount: schedule_element.schedule_element.price,
					quantity: schedule_element.quantity
				};

				this.parameters.push('transactionproducts', transaction_product, 'transactionproduct');

			});

			return Promise.resolve(true);

		}

		return Promise.resolve(false);

	}

	addProductsToTransactionProducts(){

		du.debug('Add Products To Transaction Products');

		let normalized_products = this.parameters.get('normalizedproducts', {fatal: false});

		if(arrayutilities.nonEmpty(normalized_products)){

			arrayutilities.map(normalized_products, product_group => {

				let transaction_product = {
					product: product_group.product,
					amount: this.getPriceFromProductGroup(product_group),
					quantity: product_group.quantity
				};

				this.parameters.push('transactionproducts', transaction_product, 'transactionproduct');

			});

			return Promise.resolve(true);

		}

		return Promise.resolve(false);

	}

	getPriceFromProductGroup(product_group){

		//Technical Debt:  Need to check that the product allows overrides
		if(_.has(product_group, 'price')){
			return product_group.price;
		}

		if(objectutilities.hasRecursive(product_group, 'product.default_price')){
			return product_group.product.default_price;
		}

		throw eu.getError('server', 'Unable to identify price for product: '+product_group.product.id);

	}

	buildRebillPrototype(){

		du.debug('Build Rebill Prototype');

		let normalized_product_schedules = this.parameters.get('normalizedproductschedules', {fatal: false});

		let product_schedules = null;

		if(!_.isNull(normalized_product_schedules)){

			let grouped_normalized_product_schedules = arrayutilities.group(normalized_product_schedules, normalized_product_schedule_group => {
				if(objectutilities.hasRecursive(normalized_product_schedule_group, 'product_schedule.id')){
					return 'product_schedule';
				}
				return 'watermark_product_schedule';
			});

			if(arrayutilities.nonEmpty(grouped_normalized_product_schedules['product_schedule'])){
				product_schedules = arrayutilities.map(grouped_normalized_product_schedules['product_schedule'], product_schedule_group => {
					return product_schedule_group.product_schedule.id;
				});
			}

		}

		let rebill_prototype = this.createRebillPrototype({
			session: this.parameters.get('session'),
			merchant_provider: this.parameters.get('merchantprovider', {fatal: false}),
			merchant_provider_selections: this.parameters.get('merchantproviderselections', {fatal: false}),
			transaction_products: this.parameters.get('transactionproducts'),
			bill_at: this.parameters.get('billdate'),
			amount: this.parameters.get('amount'),
			product_schedules: product_schedules
		});

		if(this.parameters.get('nextproductschedulebilldaynumber') == 0){
			rebill_prototype.processing = true;
		}

		this.parameters.set('rebillprototype', rebill_prototype);

		return Promise.resolve(true);

	}

	pushRebill(){

		du.debug('Push Rebill');

		if(!_.has(this, 'rebillController')){
			this.rebillController = new RebillController();
		}

		let prototype_rebill = this.parameters.get('rebillprototype');

		return this.rebillController.create({entity: prototype_rebill}).then(rebill => {
			this.parameters.set('rebill', rebill);
			return true;
		});

	}

	calculateCycle(){

		du.debug('Calculate Cycle');

		let prototype_rebill = this.parameters.get('rebillprototype');
		let session = this.parameters.get('session');

		return sessionController.listRebills(session).then(rebills => {

			let cycle = null;

			if (rebills) {
				du.debug('rebills', rebills);
				cycle = rebills.filter(r => moment(r.bill_at).isBefore(prototype_rebill.bill_at)).length + 1;
			} else {
				du.debug('no rebills');
			}

			prototype_rebill.cycle = cycle;

			this.parameters.set('rebillprototype', prototype_rebill);

			du.debug(`Cycle for new rebill in session ${session.id} is ${cycle}.`);

			return cycle;
		});

	}

	returnRebill(){

		du.debug('Return Rebill');

		return Promise.resolve(this.parameters.get('rebill'));

	}

	createRebillPrototype({session, transaction_products = [], bill_at = timestamp.getISO8601(), amount = 0.00, product_schedules = null, merchant_provider = null}){

		du.debug('Create Rebill Prototype');

		if(!_.has(session, 'account')){
			throw eu.getError('server', 'Session missing "account" property.');
		}

		if(!_.has(session, 'id')){
			throw eu.getError('server', 'Session missing "id" property.');
		}

		if(!stringutilities.isISO8601(bill_at)){
			throw eu.getError('server', '"bill_at" property is assumed to be a iso-8601 string.');
		}

		if(!currencyutilities.isCurrency(amount)){
			throw eu.getError('server', '"amount" property is assumed to be currency.');
		}

		let rebill_prototype = {
			account: session.account,
			parentsession: session.id,
			products: transaction_products,
			bill_at: bill_at,
			amount: amount
		};

		if(!_.isNull(merchant_provider)){
			rebill_prototype.merchant_provider = merchant_provider;
		}

		if(!_.isNull(product_schedules)){
			rebill_prototype.product_schedules = product_schedules;
		}

		return rebill_prototype

	}

};
