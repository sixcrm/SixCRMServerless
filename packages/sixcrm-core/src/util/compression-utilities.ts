import * as _ from 'lodash';
import * as zlib from 'zlib';
import du from './debug-utilities';

export default class CompressionUtilities {

	static gunzip(compressed_data: Buffer): Promise<string> {

		du.debug('G Unzip');

		return new Promise((resolve, reject) => {

			zlib.gunzip(compressed_data, (error, buffer) => {

				if (!_.isNull(error)) {
					return reject(error);
				}

				const string = buffer.toString('utf8');

				return resolve(string);

			});

		});

	}

}
