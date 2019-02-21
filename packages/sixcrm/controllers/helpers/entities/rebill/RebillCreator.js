const _ = require('lodash');
const moment = require('moment');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const numberutilities = require('@6crm/sixcrmcore/lib/util/number-utilities').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const { getProductSetupService, LegacyProduct } = require('@6crm/sixcrm-product-setup');
const Parameters = require('../../../providers/Parameters');
const ProductScheduleController = require('../../../entities/ProductSchedule');
const ProductScheduleHelperController = require('../../entities/productschedule/ProductSchedule');
const RebillController = require('../../../entities/Rebill');
const SessionController = require('../../../entities/Session');

const productScheduleController = new ProductScheduleController();
const productScheduleHelperController = new ProductScheduleHelperController();
const rebillController = new RebillController();
const sessionController = new SessionController();

module.exports = class RebillCreatorHelper {
	constructor() {
		this.parameter_definition = {
			createRebill: {
				required:{
					session:'session'
				},
				optional:{
					day:'day',
					productschedules: 'product_schedules',
					products: 'products'
				}
			}
		};

		this.parameter_validation = {
			'session': global.SixCRM.routes.path('model','entities/session.json'),
			'day': global.SixCRM.routes.path('model','helpers/rebill/day.json'),
			'productschedules': global.SixCRM.routes.path('model','helpers/rebill/productschedules.json'),
			'products': global.SixCRM.routes.path('model','helpers/rebill/products.json')
		};

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});
	}

	async createRebill(argumentation) {
		this.parameters.store = {};
		this.parameters.setParameters({argumentation, action: 'createRebill'});
		let {session, day, products, product_schedules} = argumentation;
		let normalized_products, normalized_product_schedules;

		if (session.trial_confirmation && !session.started_at) {
			return 'CONFIRMATION_REQUIRED';
		}

		if (session.completed && !session.started_at) {
			session.started_at = session.created_at;
			await sessionController.updateProperties({id: session.id, properties: { started_at: session.created_at }});
		}

		if (day === undefined) {
			day = timestamp.getDaysDifference(session.started_at);
		}

		if (product_schedules === undefined && day >= 0) {
			product_schedules = _.get(session, 'watermark.product_schedules');
		}

		if (products === undefined && product_schedules === undefined) {
			throw eu.getError('server', 'Nothing to add to the rebill.');
		}

		if (products !== undefined) {
			normalized_products = await this.normalizeProducts(products);
		}

		if (product_schedules !== undefined) {
			normalized_product_schedules = await this.normalizeProductSchedules(product_schedules);
		}

		this.validateArguments({normalized_products, normalized_product_schedules});

		try {
			this.shouldRebill({session, day, normalized_product_schedules});
		} catch(error) {
			if (_.has(error, 'code') && error.code == '520') {
				const message_code = error.message.replace('[520] ','');
				if (_.includes(['CONCLUDE', 'CONCLUDED', 'CANCELLED', 'INCOMPLETE'], message_code)) {
					return message_code;
				}
			}
			throw error;
		}

		const prototype_rebill = await this.buildRebillPrototype({session, day, normalized_products, normalized_product_schedules});
		du.debug(`Prototype rebill for session ${session.id} with amount ${prototype_rebill.amount}`);
		return rebillController.create({entity: prototype_rebill});
	}

	createRebillPrototype({session, transaction_products = [], bill_at = timestamp.getISO8601(), cycle = 0, amount = 0.00, product_schedules = null, merchant_provider = null, merchant_provider_selections = null, processing = null}){
		const rebill_prototype = {
			account: session.account,
			parentsession: session.id,
			products: transaction_products,
			bill_at,
			amount,
			cycle
		};

		if (!_.isNull(merchant_provider)) {
			rebill_prototype.merchant_provider = merchant_provider;
		}

		if (!_.isNull(merchant_provider_selections)) {
			rebill_prototype.merchant_provider_selections = merchant_provider_selections;
		}

		if (!_.isNull(product_schedules)) {
			rebill_prototype.product_schedules = product_schedules;
		}

		if (!_.isNull(processing)) {
			rebill_prototype.processing = processing;
		}

		return rebill_prototype;
	}

	async normalizeProductSchedules(product_schedules) {
		let normalized_product_schedules = arrayutilities.map(product_schedules, async product_schedule_group => {
			const {product_schedule} = product_schedule_group;
			if (_.isString(product_schedule)) {
				const result = await productScheduleHelperController.getHydrated({id: product_schedule});
				product_schedule_group.product_schedule = result;
				return product_schedule_group;
			} else if (_.isObject(product_schedule)) {
				const {products} = await productScheduleController.getProducts(product_schedule);
				if (_.isNull(products)) {
					throw eu.getError('not_found', 'Watermark product in schedule could not be found.');
				}
				const result = productScheduleHelperController.marryProductsToSchedule({product_schedule, products});
				product_schedule_group.product_schedule = result;
				return product_schedule_group;
			}
		});

		return Promise.all(normalized_product_schedules);
	}

	async normalizeProducts(products) {
		let normalized_products = arrayutilities.map(products, async product_group => {
			if (rebillController.isUUID(product_group.product)) {
				try {
					const product = await getProductSetupService().getProduct(product_group.product);
					product_group.product = LegacyProduct.hybridFromProduct(product);
					return product_group;
				} catch (e) {
					du.error('Error retrieving product', e);
					throw eu.getError('not_found', 'Product does not exist: ' +product_group.product);
				}
			} else if (_.isObject(product_group.product)) {
				return product_group;
			}
		});

		return Promise.all(normalized_products);
	}

	//Technical Debt:  Review...
	validateArguments({normalized_products, normalized_product_schedules}) {
		if (arrayutilities.nonEmpty(normalized_product_schedules)) {
			arrayutilities.map(normalized_product_schedules, normalized_product_schedule => {
				if (!objectutilities.hasRecursive(normalized_product_schedule, 'product_schedule.schedule')) {
					throw eu.getError('bad_request','Normalized product schedule is missing product_schedule.schedule element');
				}
				arrayutilities.map(normalized_product_schedule.product_schedule.schedule, schedule_element => {
					if (_.has(schedule_element, 'end') && schedule_element.end <= schedule_element.start) {
						throw eu.getError('bad_request','A schedule element end can not be less than or equal to a schedule element start.');
					}
				})
			});
		}

		if (normalized_products) {
			this.validateProductPricing(normalized_products);
		}

		if (normalized_product_schedules) {
			this.validateProductSchedulePricing(normalized_product_schedules);
		}

		return true;
	}

	shouldRebill({session, day, normalized_product_schedules}) {
		if (_.has(session, 'concluded') && session.concluded == true) {
			du.warning('Session concluded, do not rebill');
			throw eu.getError('control', 'CONCLUDED');
		}

		if (_.has(session, 'cancelled') && _.has(session.cancelled, 'cancelled') && session.cancelled.cancelled == true) {
			du.warning('Session cancelled, do not rebill');
			throw eu.getError('control', 'CANCELLED');
		}

		if (day < 0) {
			return;
		}

		if (!_.has(session, 'completed') || session.completed !== true) {
			du.warning('Session is not completed, do not rebill');
			throw eu.getError('control', 'INCOMPLETE');
		}

		if (!_.isArray(normalized_product_schedules) || !arrayutilities.nonEmpty(normalized_product_schedules)) {
			du.warning('No product schedules, do not rebill');
			throw eu.getError('control', 'CONCLUDE');
		}
	}

	validateProductPricing(product_groups) {
		const valid = arrayutilities.every(product_groups, product_group => {
			if (!_.has(product_group, 'price')) {
				return true;
			}
			return product_group.price >= 0;
		});

		if (!valid) {
			throw eu.getError('bad_request', 'Price must be greater than or equal to zero.');
		}

		return valid;
	}

	validateProductSchedulePricing(product_schedules) {
		const valid = arrayutilities.every(product_schedules, product_schedule => {
			const products = product_schedule.product_schedule.schedule;
			return arrayutilities.every(products, product_group => {
				if (!_.has(product_group, 'price')) {
					return true;
				}
				return product_group.price >= 0;
			});
		});

		if (!valid) {
			throw eu.getError('bad_request', 'Price must be greater than or equal to zero.');
		}

		return valid;
	}

	getTransactionProducts({session, bill_day, normalized_product_schedules, normalized_products}) {
		du.debug(`getTransactionProducts: ${JSON.stringify({bill_day, normalized_product_schedules, normalized_products})}`);
		const transaction_products = [];
		const schedule_elements = this.getScheduleElementsOnBillDay({session, bill_day, normalized_product_schedules});
		du.debug(`schedule_elements: ${JSON.stringify(schedule_elements)}`);
		this.addScheduleElementsToTransactionProducts(schedule_elements, transaction_products);
		du.debug(`transaction_products: ${JSON.stringify(transaction_products)}`);
		this.addProductsToTransactionProducts(normalized_products, transaction_products);
		return transaction_products;
	}

	getNextProductScheduleBillDayNumber({day, normalized_product_schedules}) {
		if (normalized_product_schedules !== undefined) {
			let start_day_numbers = arrayutilities.map(normalized_product_schedules, product_schedule_group => {
				return productScheduleHelperController.getNextScheduleElementStartDayNumber({day: day, product_schedule: product_schedule_group.product_schedule});
			});

			start_day_numbers =  arrayutilities.filter(start_day_numbers, start_day_number => {
				return numberutilities.isInteger(start_day_number);
			});

			let next_schedule_element_start_day_number = arrayutilities.reduce(start_day_numbers, (min, value) => {
				if (!numberutilities.isInteger(min)) {
					return value;
				}

				if (value < min) {
					return value;
				}

				return min;
			}, null);

			if (!_.isNull(next_schedule_element_start_day_number)) {
				return next_schedule_element_start_day_number;
			}
		} else {
			if (day < 0) {
				return 0;
			} else {
				throw eu.getError('server', 'Unrecognized case: day is greater than or equal to 0 but there are no normalized product schedules.');
			}
		}
	}

	async getMerchantProviderSelections(session, day) {
		let merchant_provider, merchant_provider_selections;
		if (day >= 0) {
			const previous_rebills = await sessionController.listRebills(session);
			if (!_.isArray(previous_rebills) || previous_rebills.length === 0) {
				return {};
			}

			const previous_rebills_ordered = _.orderBy(previous_rebills, [rebill => new Date(rebill.bill_at)], ['desc']);
			const last_rebill = previous_rebills_ordered[0];
			merchant_provider = last_rebill.merchant_provider;
			merchant_provider_selections = last_rebill.merchant_provider_selections;
		}

		return {merchant_provider, merchant_provider_selections};
	}

	getScheduleElementsOnBillDay({session, bill_day, normalized_product_schedules}) {
		let schedule_elements = [];

		if (normalized_product_schedules === undefined) {
			return;
		}

		arrayutilities.map(normalized_product_schedules, normalized_product_schedule => {
			let sub_elements = productScheduleHelperController.getScheduleElementsOnDayInSchedule({start_date: session.started_at, day: bill_day, product_schedule: normalized_product_schedule.product_schedule})
			if (!_.isNull(sub_elements) && arrayutilities.nonEmpty(sub_elements)) {
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

		if (arrayutilities.nonEmpty(schedule_elements)) {
			return schedule_elements;
		}
	}

	addScheduleElementsToTransactionProducts(schedule_elements, transaction_products) {
		if (schedule_elements === undefined) {
			return;
		}
		arrayutilities.map(schedule_elements, schedule_element => {
			let transaction_product = {
				product: schedule_element.schedule_element.product,
				amount: schedule_element.schedule_element.price,
				quantity: schedule_element.quantity
			};
			transaction_products.push(transaction_product);
		});
	}

	addProductsToTransactionProducts(normalized_products, transaction_products) {
		if (normalized_products === undefined) {
			return;
		}
		arrayutilities.map(normalized_products, product_group => {
			let transaction_product = {
				product: product_group.product,
				amount: this.getPriceFromProductGroup(product_group),
				quantity: product_group.quantity
			};
			transaction_products.push(transaction_product);
		});
	}

	getPriceFromProductGroup(product_group) {
		//Technical Debt:  Need to check that the product allows overrides
		if (_.has(product_group, 'price')) {
			return product_group.price;
		}

		if (objectutilities.hasRecursive(product_group, 'product.default_price')) {
			return product_group.product.default_price;
		}

		throw eu.getError('server', 'Unable to identify price for product: '+product_group.product.id);
	}

	async buildRebillPrototype({session, day, normalized_products, normalized_product_schedules}) {
		const product_schedules = this.getGroupedProductSchedules(normalized_product_schedules);
		const bill_day = this.getNextProductScheduleBillDayNumber({day, normalized_product_schedules});
		const {merchant_provider, merchant_provider_selections} = await this.getMerchantProviderSelections(session, day);
		const transaction_products = this.getTransactionProducts({session, bill_day, normalized_product_schedules, normalized_products});
		const amount = this.calculateAmount(transaction_products);
		const bill_at = this.calculateBillAt(session, bill_day);
		const cycle = await this.calculateCycle(session, bill_at);

		const rebill_prototype = this.createRebillPrototype({
			session,
			transaction_products,
			product_schedules,
			merchant_provider,
			merchant_provider_selections,
			bill_at,
			amount,
			cycle
		});

		if (bill_day <= 0) {
			rebill_prototype.processing = true;
		}

		return rebill_prototype;
	}

	getGroupedProductSchedules(normalized_product_schedules) {
		let product_schedules;

		if (normalized_product_schedules !== undefined) {
			let grouped_normalized_product_schedules = arrayutilities.group(normalized_product_schedules, normalized_product_schedule_group => {
				if (objectutilities.hasRecursive(normalized_product_schedule_group, 'product_schedule.id')) {
					return 'product_schedule';
				}
				return 'watermark_product_schedule';
			});

			if (arrayutilities.nonEmpty(grouped_normalized_product_schedules['product_schedule'])) {
				product_schedules = arrayutilities.map(grouped_normalized_product_schedules['product_schedule'], product_schedule_group => {
					return product_schedule_group.product_schedule.id;
				});
			}
		}

		return product_schedules;
	}

	async calculateCycle(session, bill_at) {
		const rebills = await sessionController.listRebills(session);
		let cycle = 0;

		if (rebills) {
			cycle = rebills.filter(r => moment(r.bill_at).isBefore(bill_at)).length;
		}

		return cycle;
	}

	calculateAmount(products) {
		du.debug(`calculateAmount on products: ${JSON.stringify(products)}`);
		let amount = 0.0;

		if (!_.isNull(products) && arrayutilities.nonEmpty(products)) {
			amount = arrayutilities.reduce(products, (sum, object) => {
				return sum + numberutilities.formatFloat((object.amount * object.quantity), 2);
			}, amount);
		}

		return numberutilities.formatFloat(amount, 2);
	}

	calculateBillAt(session, bill_day) {
		let session_start = parseInt(timestamp.dateToTimestamp(session.started_at));
		let additional_seconds = timestamp.getDayInSeconds() * bill_day;
		let bill_date = timestamp.toISO8601(session_start + additional_seconds);
		du.warning(session.started_at+' plus '+bill_day+' days should equal '+bill_date);
		return bill_date;
	}
};
