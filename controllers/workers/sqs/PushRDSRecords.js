'use strict';

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayUtilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const sqsUtilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

module.exports = class PushRDSRecords {

	constructor(queueName, auroraContext) {

		this._queueName = queueName;
		this._auroraContext = auroraContext;

	}

	get queueName() {

		return this._queueName;

	}

	execute() {

		du.debug('PushRDSRecordsController.execute()');

		return this._getRecordsFromSQS()
			.then(records => this._executeBatchWrite(records))
			.then(records => this._removeRecordsFromSQS(records));

	}

	_getRecordsFromSQS() {

		du.debug('PushRDSRecordsController._getRecordsFromSQS()');

		return sqsUtilities.receiveMessagesRecursive({
			queue: this._queueName
		});

	}

	_executeBatchWrite(records) {

		du.debug('PushRDSRecordsController._executeBatchWrite()');

		if (arrayUtilities.nonEmpty(records)) {

			return this.executeBatchWriteQuery(records.map(r => JSON.parse(r.Body)))
				.then(() => {

					return records;

				});

		}

		return Promise.resolve(records);

	}

	// override
	executeBatchWriteQuery(records) {

		du.debug('PushRDSRecordsController.executeBatchWriteQuery()');

		return Promise.resolve(records);

	}

	_removeRecordsFromSQS(records) {

		du.debug('PushRDSRecordsController._removeRecordsFromSQS()');

		if (arrayUtilities.nonEmpty(records)) {

			return sqsUtilities.deleteMessages({
				messages: records,
				queue: this._queueName
			});

		} else {

			return Promise.resolve();

		}

	}

}