const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class ConfirmEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(record) {

		du.debug('ConfirmEventHandler.execute()', record);

		return Promise.resolve();

	}

}
