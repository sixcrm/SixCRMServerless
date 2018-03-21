const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class OrderEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(record) {

		du.debug('OrderEventHandler.execute()', record);

		return Promise.resolve();

	}

}
