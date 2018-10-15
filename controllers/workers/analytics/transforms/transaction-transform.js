const _ = require('lodash');
const util = require('util');
const AnalyticsTransform = require('../analytics-transform');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const MerchantProviderController = global.SixCRM.routes.include('controllers', 'entities/MerchantProvider.js');
const CampaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');
const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');

module.exports = class TransactionTransform extends AnalyticsTransform {

	async transform(record) {

		du.debug('TransactionTransform.transform()', util.inspect(record, {
			showHidden: false,
			depth: null
		}));

		const result = {
			eventType: record.event_type,
			id: record.context.transaction.id,
			alias: record.context.transaction.alias,
			datetime: record.context.transaction.created_at,
			associatedTransaction: record.context.transaction.associated_transaction,
			merchantProvider: {
				id: record.context.transaction.merchant_provider
			},
			merchantCode: record.context.merchantCode,
			merchantMessage: record.context.merchantMessage,
			processorResult: record.context.transaction.result,
			amount: record.context.transaction.amount,
			type: record.context.transaction.type,
			subtype: record.context.transactionSubType,
			transactionType: record.context.transactionType,
			customer: {
				id: record.context.session.customer
			},
			creditcard: '',
			campaign: {
				id: record.context.session.campaign
			},
			account: record.context.session.account,
			affiliate: record.context.session.affiliate,
			subAffiliate1: record.context.session.subaffiliate_1,
			subAffiliate2: record.context.session.subaffiliate_2,
			subAffiliate3: record.context.session.subaffiliate_3,
			subAffiliate4: record.context.session.subaffiliate_4,
			subAffiliate5: record.context.session.subaffiliate_5,
			session: {
				id: record.context.session.id,
				alias: record.context.session.alias,
				datetime: record.context.session.created_at,
				account: record.context.session.account,
				campaign: record.context.session.campaign,
				cid: record.context.session.cid,
				affiliate: record.context.session.affiliate,
				subAffiliate1: record.context.session.subaffiliate_1,
				subAffiliate2: record.context.session.subaffiliate_2,
				subAffiliate3: record.context.session.subaffiliate_3,
				subAffiliate4: record.context.session.subaffiliate_4,
				subAffiliate5: record.context.session.subaffiliate_5
			},
			rebill: {
				id: record.context.rebill.id,
				alias: record.context.rebill.alias
			},
			products: record.context.transaction.products.map(p => {

				const productSchedules = [];

				// we need the product schedules off the rebill, but they do not include the product schedule name

				if (record.context.rebill && record.context.rebill.product_schedules) {

					productSchedules.push(..._.reduce(record.context.rebill.product_schedules, (memo, psRebill) => {

						// check to see if this product matches the schedules listed in the session so we can resolve the product schedule name

						if (!record.context.session.watermark || !record.context.session.watermark.product_schedules) {

							// there is no watermark on the session... this is bad, we cannot resolve the product to a schedule
							du.warning('TransactionTransform.transform(): cannot resolve product schedules, watermark does not exist on session');

						} else {

							// there is a watermark on the session, return it's schedule
							memo.push(..._.filter(record.context.session.watermark.product_schedules, psWatermark => {

								return psRebill === psWatermark.product_schedule.id && _.find(psWatermark.product_schedule.schedule, s => {

									return s.product.id === p.product.id;

								});

							}));

						}

						return memo;

					}, []));

				}

				// console.log(productSchedules);

				return {
					id: p.product.id,
					name: p.product.name,
					amount: p.amount,
					quantity: p.quantity,
					sku: p.product.sku,
					fulfillmentProvider: p.product.fulfillment_provider,
					productSchedules: productSchedules.map(ps => {

						return {
							id: ps.product_schedule.id,
							name: ps.product_schedule.name
						};

					})
				}
			})
		};

		if (result.merchantMessage) {
			result.merchantMessage = result.merchantMessage.substring(0, 255)
		}

		result.amount = Math.abs(result.amount);
		if (result.transactionType === 'refund' || result.transactionType === 'reverse') {

			result.amount = -result.amount;

		}

		try {

			const controller = new MerchantProviderController();
			controller.disableACLs();
			const response = await controller.get({
				id: record.context.transaction.merchant_provider,
				fatal: true
			});

			result.merchantProvider.name = response.name;
			result.merchantProvider.monthlyCap = response.processing.monthly_cap;

		} catch (ex) {

			du.warning('TransactionTransform.transform(): could not resolve merchant provider', ex);

		}

		try {

			const campaignController = new CampaignController();
			campaignController.disableACLs();
			const response = await campaignController.get({
				id: record.context.session.campaign,
				fatal: true
			});

			result.campaign.name = response.name;

		} catch (ex) {

			du.warning('TransactionTransform.transform(): could not resolve campaign', ex);

		}

		try {

			const customerController = new CustomerController();
			customerController.disableACLs();
			const response = await customerController.get({
				id: record.context.session.customer,
				fatal: true
			});

			if (response.firstname && response.lastname) {

				result.customer.name = `${response.firstname} ${response.lastname}`;

			}

		} catch (ex) {

			du.warning('TransactionTransform.transform(): could not resolve customer', ex);

		}

		return result;

	}

}
