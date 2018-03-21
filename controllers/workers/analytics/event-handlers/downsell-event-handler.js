const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class DownsellEventHandler {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(record) {

		du.debug('DownsellEventHandler.execute()', record);

		return Promise.resolve();

	}

}
