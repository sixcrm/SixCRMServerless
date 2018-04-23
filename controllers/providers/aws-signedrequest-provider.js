const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const hashutilities = global.SixCRM.routes.include('lib', 'hash-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

const HTTPProvider = global.SixCRM.routes.include('providers', 'http-provider.js');

module.exports = class AWSSignedRequestProvider {

	constructor() {

	}

	signedRequest(endpoint, body) {

		du.debug('Signed Request');

		return Promise.resolve()
			.then(() => this.validateEnvironment())
			.then(() => this.buildSignedRequest(endpoint, body))
			.then((request_parameters) => this.executeRequest(request_parameters));

	}

	validateEnvironment() {

		du.debug('Validate Environment');

		du.info(process.env);
		if (!_.has(process.env, 'AWS_SESSION_TOKEN')) {
			throw eu.getError('server', 'Missing "AWS_SESSION_TOKEN" in process.env');
		}

		if (!_.has(process.env, 'AWS_SECRET_ACCESS_KEY')) {
			throw eu.getError('server', 'Missing "AWS_SECRET_ACCESS_KEY" in process.env');
		}

		return true;

	}

	executeRequest(request_parameters) {

		du.debug('Execute Request');

		let parameters = {
			endpoint: request_parameters.host + request_parameters.path,
			body: request_parameters.body,
			headers: request_parameters.headers
		};

		let httpprovider = new HTTPProvider();

		return httpprovider.post(parameters).then(response => {

			let info = stringutilities.parseJSONString(response.body);
			let failed_items = [];
			let success = null;
			let error = null;

			if (response.statusCode >= 200 && response.statusCode < 299) {

				if (_.has(info, 'items') && _.isArray(info.items)) {

					if (arrayutilities.nonEmpty(info.items)) {
						failed_items = arrayutilities.filter(info.items, (item) => {
							return item.index.status >= 300;
						});
					}

					success = {
						attemptedItems: info.items.length,
						successfulItems: (info.items.length - failed_items.length),
						failedItems: failed_items.length
					};

				}

			}

			if (response.statusCode !== 200 || (_.has(info, 'errors') && info.errors === true)) {
				error = {
					statusCode: response.statusCode,
					responseBody: response.body
				}
			}

			return {
				error: error,
				success: success,
				statusCode: response.statusCode,
				failedItems: failed_items
			};

		});

	}

	buildSignedRequest(endpoint, body) {

		du.debug('Build Signed Request');

		var endpointParts = endpoint.match(/^([^\.]+)\.?([^\.]*)\.?([^\.]*)\.amazonaws\.com$/); // eslint-disable-line no-useless-escape
		var region = endpointParts[2];
		var service = endpointParts[3];
		var datetime = (timestamp.getISO8601().replace(/[:\-]|\.\d{3}/g, '')); // eslint-disable-line no-useless-escape
		var date = datetime.substr(0, 8);
		var kDate = hashutilities.toHMAC('AWS4' + process.env.AWS_SECRET_ACCESS_KEY, date);
		var kRegion = hashutilities.toHMAC(kDate, region);
		var kService = hashutilities.toHMAC(kRegion, service);
		var kSigning = hashutilities.toHMAC(kService, 'aws4_request');

		var request = {
			host: endpoint,
			method: 'POST',
			path: '/_bulk',
			body: body,
			headers: {
				'Content-Type': 'application/json',
				'Host': endpoint,
				'Content-Length': Buffer.byteLength(body),
				'X-Amz-Security-Token': process.env.AWS_SESSION_TOKEN,
				'X-Amz-Date': datetime
			}
		};

		var canonicalHeaders = Object.keys(request.headers)
			.sort(function(a, b) {
				return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
			})
			.map(function(k) {
				return k.toLowerCase() + ':' + request.headers[k];
			})
			.join('\n');

		var signedHeaders = Object.keys(request.headers)
			.map(function(k) {
				return k.toLowerCase();
			})
			.sort()
			.join(';');

		var canonicalString = [
			request.method,
			request.path, '',
			canonicalHeaders, '',
			signedHeaders,
			hashutilities.toSHA1(request.body),
		].join('\n');

		var credentialString = [date, region, service, 'aws4_request'].join('/');

		var stringToSign = [
			'AWS4-HMAC-SHA256',
			datetime,
			credentialString,
			hashutilities.toSHA1(canonicalString)
		].join('\n');

		request.headers.Authorization = [
			'AWS4-HMAC-SHA256 Credential=' + process.env.AWS_ACCESS_KEY_ID + '/' + credentialString,
			'SignedHeaders=' + signedHeaders,
			'Signature=' + hashutilities.toHMAC(kSigning, stringToSign, 'hex')
		].join(', ');

		return request;

	}

}
