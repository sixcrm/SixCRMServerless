const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class AnalyticsTransform {

	execute(record) {

		du.debug('AnalyticsTransform.execute()');

		return this.transform(record)
		.catch((ex) => {

			du.error('AnalyticsTransform.execute()', record, ex);

		});

	}

	// override
	transform(record) {

		return new Promise(record);

	}

}
