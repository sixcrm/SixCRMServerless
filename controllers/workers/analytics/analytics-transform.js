const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class AnalyticsTransform {

	async execute(record) {

		du.debug('AnalyticsTransform.execute()');

		try {

			return await this.transform(record)

		} catch (ex) {

			du.error('AnalyticsTransform.execute()', record, ex);

			throw ex;

		}

	}

	// override
	async transform(record) {

		return new Promise(record);

	}

}
