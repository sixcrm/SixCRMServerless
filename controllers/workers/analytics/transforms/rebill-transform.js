const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class RebillTransform {

	execute(record) {

		du.debug('RebillTransform.execute()');

		return Promise.resolve({
			id_rebill: record.context.transformedrebill.id_rebill,
			datetime: record.context.transformedrebill.datetime,
			current_queuename: record.context.transformedrebill.current_queuename,
			previous_queuename: record.context.transformedrebill.previous_queuename,
			account: record.context.transformedrebill.account,
			amount: record.context.transformedrebill.amount,
			type: record.event_type
		});

	}

}