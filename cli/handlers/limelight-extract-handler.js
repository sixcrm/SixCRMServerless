const du = require('../../lib/debug-utilities');
const ExtractHandler = require('./extract-handler');

module.exports = class LimelightExtractHandler extends ExtractHandler {

	constructor(client, user, password) {

		super('limelight', client, user, password);

	}

	async _extract() {

		du.debug('LimelightExtractHandler#_extract()');

	}

}
