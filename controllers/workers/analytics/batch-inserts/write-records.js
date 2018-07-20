const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports = class WriteRecords {

	constructor(auroraContext) {

		this._auroraContext = auroraContext;

	}

	execute(records) {

		records = this.dedupe(records);

		return this.write(records);

	}

	dedupe(records) {

		du.debug('Dedupe');

		return _.uniqBy(records, this.getRecordKey);

	}

	// override this
	// eslint-disable-next-line no-unused-vars
	getRecordKey(record) {

		throw new Error('Unimplemented de-duplication in analytics batch insert');

	}

	// override this
	// eslint-disable-next-line no-unused-vars
	write(records) {

		throw new Error('Unimplemented analytics batch insert');

	}

}
