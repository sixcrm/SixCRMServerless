const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class ClickEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(record) {

		du.debug('ClickEventHandler.execute()', record);

		return Promise.resolve();

	}

}
