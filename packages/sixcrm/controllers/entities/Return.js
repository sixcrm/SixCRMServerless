const _ = require('lodash');
const { getProductSetupService, LegacyProduct } = require('@6crm/sixcrm-product-setup');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
const RebillController = global.SixCRM.routes.include('entities','Rebill.js');
const SessionController = global.SixCRM.routes.include('entities','Session.js');
const CustomerController = global.SixCRM.routes.include('entities','Customer.js');
const CampaignController = global.SixCRM.routes.include('entities','Campaign.js');
const CreditCardController = global.SixCRM.routes.include('entities','CreditCard.js');
const TransactionController = global.SixCRM.routes.include('entities','Transaction.js');
const ProductHelperController = global.SixCRM.routes.include('helpers', 'entities/product/Product.js');

module.exports = class ReturnController extends entityController {

	constructor() {

		super('return');

		this.search_fields = ['alias'];

		this.transactionController = new TransactionController();
		this.rebillController = new RebillController();
		this.sessionController = new SessionController();
		this.customerController = new CustomerController();
		this.campaignController = new CampaignController();
		this.creditCardController = new CreditCardController();
		this.productHelperController = new ProductHelperController();

	}

	//Technical Debt: finish!
	associatedEntitiesCheck() {
		return Promise.resolve([]);
	}

	create({
		entity
	}) {
		const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
		let returnHelperController = new ReturnHelperController();

		if (!_.has(entity, 'alias')) {
			entity.alias = returnHelperController.createAlias();
		}

		return returnHelperController.mergeHistories(entity).then((entity) => super.create({
			entity: entity
		})).then(async (ret) => {
			let EventsHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			let eventHelperController = new EventsHelperController();
			let transaction_id = _(ret).at('transactions[0].transaction').toString();
			let transaction = await this.transactionController.get({id: transaction_id});
			let rebill = await this.rebillController.get({id: transaction.rebill});
			let session = await this.sessionController.get({id: rebill.parentsession});
			let customer = await this.customerController.get({id: session.customer});
			let campaign = await this.campaignController.get({id: session.campaign});

			for (let transaction of ret.transactions) {
				for (let product of transaction.products) {
					product.product = LegacyProduct.hybridFromProduct(
						await getProductSetupService().getProduct(product.product)
					);
					product.image = this.productHelperController.getDefaultImage(product.product);
				}
			}

			let context = {
				'return': ret,
				rebill,
				transaction,
				session,
				customer,
				campaign
			};

			if (transaction.creditcard) {
				context.creditcard = await this.creditCardController.get({id: transaction.creditcard});
			}

			return eventHelperController.pushEvent({event_type: 'return', context: context}).then(() => ret);
		});

	}

	update({
		entity,
		ignore_updated_at
	}) {
		const ReturnHelperController = global.SixCRM.routes.include('helpers', 'entities/return/Return.js');
		let returnHelperController = new ReturnHelperController();

		return returnHelperController.mergeHistories(entity).then((entity) => super.update({
			entity: entity,
			ignore_updated_at: ignore_updated_at
		}));

	}

}
