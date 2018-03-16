const PushRDSRecords = require('../sqs/PushRDSRecords');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

module.exports = class PushTransactionRecords extends PushRDSRecords {

	constructor() {

		super('rds_transaction_batch');

	}

	executeBatchWriteQuery() {

		du.debug('PushTransactionRecords.executeBatchWriteQuery()');

		return Promise.resolve();

	}

}