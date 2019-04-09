const _ = require('lodash');
const { isArray, orderBy, sortBy, isObject } = require('lodash');
const moment = require('moment');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const numberutilities = require('@6crm/sixcrmcore/lib/util/number-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const { getProductSetupService, getProductScheduleService, LegacyProduct } = require('@6crm/sixcrm-product-setup');
const Parameters = require('../../../providers/Parameters');
const RebillController = require('../../../entities/Rebill');
const SessionController = require('../../../entities/Session');

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

	async createRebill({ session, day, products, product_schedules }) {
		let normalizedProducts, productSchedule;

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
			normalizedProducts = await this.normalizeProducts(products);
		}

		if (product_schedules) {
			du.debug(`normalize product schedules: ${JSON.stringify(product_schedules)}`);
			productSchedule = await normalizeProductSchedule(product_schedules[0]);
		}

		try {
			const rebill = await buildRebill({ session, day, products: normalizedProducts, productSchedule });
			du.debug(`Creating rebill for session ${session.id} with amount ${rebill.amount}`);
			return rebillController.create({ entity: rebill });
		} catch(error) {
			if (_.has(error, 'code') && error.code == '520') {
				const message_code = error.message.replace('[520] ','');
				if (_.includes(['CONCLUDE', 'CONCLUDED', 'CANCELLED', 'INCOMPLETE'], message_code)) {
					return message_code;
				}
			}
			throw error;
		}
	}

	createRebillPrototype(rebillOptions) {
		return createRebillPrototype(rebillOptions);
	}

	async normalizeProducts(products) {
		let normalized_products = arrayutilities.map(products, async product_group => {
			if (stringutilities.isUUID(product_group.product)) {
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
};

const normalizeProductSchedule = async (productSchedule) => {
	const { product_schedule } = productSchedule;
	let productScheduleResult;
	if (stringutilities.isUUID(product_schedule)) {
		try {
			productScheduleResult = await getProductScheduleService().get(product_schedule);
		} catch (e) {
			du.error('Error retrieving product schedule', e);
			throw eu.getError('not_found', `Product schedule does not exist: ${productSchedule}`);
		}
	} else if (isObject(product_schedule)) {
		du.warning('Todo: reimplement marry products to schedule?');
		productScheduleResult = product_schedule;
	}

	productSchedule.product_schedule = {
		...productScheduleResult,
		cycles: productScheduleResult.cycles.map(cycle => ({
			...cycle,
			cycle_products: cycle.cycle_products.map(cycleProduct => ({
				...cycleProduct,
				product: {
					id: cycleProduct.product.id,
					name: cycleProduct.product.name
				}
			}))
		}))
	};
	return productSchedule;
};

const buildRebill = async ({
	session,
	day,
	products,
	productSchedule
}) => {
	const { cancelled: { cancelled } = {}, completed, concluded } = session;

	if (concluded) {
		du.warning("Session concluded, do not rebill");
		throw eu.getError("control", "CONCLUDED");
	}

	if (cancelled) {
		du.warning("Session cancelled, do not rebill");
		throw eu.getError("control", "CANCELLED");
	}

	if (day >= 0) {
		if (!completed) {
			du.warning('Session is not completed, do not rebill');
			throw eu.getError('control', 'INCOMPLETE');
		}

		if (!productSchedule) {
			du.warning('No product schedules, do not rebill');
			throw eu.getError('control', 'CONCLUDE');
		}
	}

	return buildRebillEntity({
		session,
		day,
		products,
		productSchedule
	});
};

const buildRebillEntity = async ({
	session,
	day,
	products = [],
	productSchedule: { product_schedule } = {}
}) => {
	du.debug(`Build rebill entity: ${JSON.stringify({ session, day, products, product_schedule })}`);
	const previousRebill = day >= 0 ? await getMostRecentRebill(session) : null;
	const position = previousRebill ? previousRebill.cycle + 2 : 1;
	const cycle = product_schedule ? getCurrentCycle({ cycles: product_schedule.cycles, position }) : null;
	const amount = calculateAmount({ products, cycle });
	const transaction_products = getTransactionProducts({ products, cycle });
	const billDay = getNextProductScheduleBillDayNumber({ day, cycle, previousRebill });
	const bill_at = calculateBillAt(session, billDay);

	return {
		...createRebillPrototype({
			session,
			transaction_products,
			product_schedules: product_schedule ? [product_schedule.id] : null,
			bill_at,
			cycle: position - 1,
			amount,
			...(previousRebill ? { merchant_provider: previousRebill.merchant_provider, merchant_provider_selections: previousRebill.merchant_provider_selections } : {})
		}),
		...(billDay <= 0 ? { processing: true } : {})
	};
}

const createRebillPrototype = ({
	session: { account, id: parentsession },
	transaction_products = [],
	bill_at = timestamp.getISO8601(),
	cycle = 0,
	amount = 0.0,
	product_schedules,
	merchant_provider,
	merchant_provider_selections,
	processing
}) => ({
	account,
	parentsession,
	products: transaction_products,
	bill_at,
	amount,
	cycle,
	...(merchant_provider ? { merchant_provider } : {}),
	...(merchant_provider_selections ? { merchant_provider_selections } : {}),
	...(product_schedules ? { product_schedules } : {}),
	...(processing !== undefined ? { processing } : {}),
});

const getMostRecentRebill = async (session) => {
	const sessionPreviousRebills = await sessionController.listRebills(session);
	if (!isArray(sessionPreviousRebills) || sessionPreviousRebills.length === 0) {
		return null;
	}

	const [mostRecentRebill] = orderBy(sessionPreviousRebills, [rebill => new Date(rebill.bill_at)], ['desc']);
	return mostRecentRebill;
};

const getCurrentCycle = ({ cycles, position }) => {
	const sortedCycles = sortBy(cycles, 'position');
	const index = position - 1;

	if (sortedCycles[index]) {
		return sortedCycles[index];
	}

	// TODO handle repeating sets of cycles
	return sortedCycles.pop();
};

const calculateAmount = ({ products, cycle }) => {
	du.debug(`calculateAmount on products: ${JSON.stringify(products)}, cycle: ${JSON.stringify(cycle)}`);
	const cycleAmount = cycle ? calculateCycleAmount(cycle) : 0.0;
	const totalAmount = products.reduce(
		(amount, product) =>
			amount +
			numberutilities.formatFloat(product.amount * product.quantity, 2),
		cycleAmount
	);
	return numberutilities.formatFloat(totalAmount, 2);
};

const getTransactionProducts = ({ products = [], cycle }) => {
	const cycle_products = cycle ? cycle.cycle_products : [];
	const productGroups = products.map(productGroup => ({
		...productGroup,
		is_cycle_product: false
	}));
	const cycleProductGroups = cycle_products.map(cycleProduct => ({
		...cycleProduct,
		amount: calculateCycleAmount(cycle),
		is_cycle_product: true
	}));

	return [...productGroups, ...cycleProductGroups];
};

// TODO use a real currency library
const calculateCycleAmount = ({ price, shipping_price = 0 }) => numberutilities.formatFloat(parseFloat(price) + parseFloat(shipping_price), 2);

const getNextProductScheduleBillDayNumber = ({ day, cycle, previousRebill }) => {
	if (!cycle) {
		return 0;
	}

	du.debug(`Next bill day`, day, cycle, previousRebill);

	const { length } = cycle;

	if (length.days) {
		return day + length.days;
	}

	const previousBillAt = moment.utc(previousRebill.bill_at);
	const billAt = previousBillAt.clone().add(1, 'months');
	return moment.duration(billAt.diff(previousBillAt)).asDays();
}

const calculateBillAt = (session, bill_day) => {
	let session_start = parseInt(timestamp.dateToTimestamp(session.started_at));
	let additional_seconds = timestamp.getDayInSeconds() * bill_day;
	let bill_date = timestamp.toISO8601(session_start + additional_seconds);
	du.warning(session.started_at+' plus '+bill_day+' days should equal '+bill_date);
	return bill_date;
}