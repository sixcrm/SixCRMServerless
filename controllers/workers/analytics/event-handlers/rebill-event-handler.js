const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class RebillEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(record) {

		du.debug('RebillEventHandler.execute()', record);

		return Promise.resolve();

	}

}
