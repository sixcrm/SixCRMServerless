const _ = require('lodash');
const AnalyticsTransfrom = require('../analytics-transform');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const MerchantProviderController = global.SixCRM.routes.include('controllers', 'entities/MerchantProvider.js');

module.exports = class TransactionTransform extends AnalyticsTransfrom {

	async transform(record) {

		du.debug('TransactionTransform.transform()', record.event_type);

		const result = {
			eventType: record.event_type,
			id: record.context.transaction.id,
			datetime: record.context.transaction.created_at,
			associatedTransaction: record.context.transaction.associated_transaction,
			merchantProvider: {
				id: record.context.transaction.merchant_provider
			},
			processorResult: record.context.transaction.result,
			amount: record.context.transaction.amount,
			type: record.context.transaction.type,
			subtype: record.context.transactionSubType,
			transactionType: record.context.transactionType,
			customer: record.context.session.customer,
			creditcard: '',
			campaign: record.context.session.campaign,
			account: record.context.session.account,
			affiliate: record.context.session.affiliate,
			subAffiliate1: record.context.session.subaffiliate_1,
			subAffiliate2: record.context.session.subaffiliate_2,
			subAffiliate3: record.context.session.subaffiliate_3,
			subAffiliate4: record.context.session.subaffiliate_4,
			subAffiliate5: record.context.session.subaffiliate_5,
			session: {
				id: record.context.session.id,
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
			products: record.context.transaction.products.map(p => {

				const productSchedules = [];

				if (record.context.rebill && record.context.rebill.product_schedules) {

					productSchedules.push(..._.reduce(record.context.rebill.product_schedules, (memo, psRebill) => {

						// check to see if this product matches the schedules listed in the session
						memo.push(..._.filter(record.context.session.watermark.product_schedules, psWatermark => {

							return psRebill === psWatermark.product_schedule.id && _.find(psWatermark.product_schedule.schedule, s => {

								return s.product.id === p.product.id;

							});

						}));

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

		try {

			const controller = new MerchantProviderController();
			const response = await controller.get({
				id: record.context.transaction.merchant_provider,
				fatal: true
			});
			result.merchantProvider.name = response.name;
			result.merchantProvider.monthlyCap = response.processing.monthly_cap;

		} catch (ex) {

			du.warning('TransactionTransform.transform(): could not resolve merchant provider', ex);

		}

		return result;

	}

}
