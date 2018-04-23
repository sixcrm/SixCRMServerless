const _ = require('lodash');
const zlib = require('zlib');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

class CompressionUtilities {

	static gunzip(compressed_data) {

		du.debug('G Unzip');

		return new Promise((resolve, reject) => {

			zlib.gunzip(compressed_data, (error, buffer) => {

				if (!_.isNull(error)) {
					return reject(error);
				}

				let string = buffer.toString('utf8');

				return resolve(string);

			});

		});

	}

}


module.exports = CompressionUtilities;
