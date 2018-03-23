const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class TransactionEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(record) {

		du.debug('TransactionEventHandler.execute()', record);

		return Promise.resolve();

	}

}
