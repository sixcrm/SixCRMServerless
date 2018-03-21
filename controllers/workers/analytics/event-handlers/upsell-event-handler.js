const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class UpsellEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(record) {

		du.debug('UpsellEventHandler.execute()', record);

		return Promise.resolve();

	}

}
