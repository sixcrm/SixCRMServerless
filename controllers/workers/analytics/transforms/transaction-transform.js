const _ = require('lodash');
const AnalyticsTransfrom = require('../analytics-transform');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class TransactionTransform extends AnalyticsTransfrom {

	transform(record) {

		du.debug('TransactionTransform.transform()', record.event_type);

		return Promise.resolve({
			id: record.context.transaction.id,
			datetime: record.context.transaction.created_at,
			session: record.context.session.id,
			merchantProvider: record.context.transaction.merchant_provider,
			processorResult: record.context.transaction.result,
			amount: record.context.transaction.amount,
			type: record.context.transaction.type,
			subtype: record.transaction_subtype,
			customer: record.context.session.customer,
			creditcard: record.context.registerresponse.parameters.store.creditcard.number,
			campaign: record.context.session.campaign,
			account: record.context.session.account,
			affiliate: record.context.session.affiliate,
			subaffiliate1: record.context.session.subaffiliate_1,
			subaffiliate2: record.context.session.subaffiliate_2,
			subaffiliate3: record.context.session.subaffiliate_3,
			subaffiliate4: record.context.session.subaffiliate_4,
			subaffiliate5: record.context.session.subaffiliate_5,
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
		});

	}

}
