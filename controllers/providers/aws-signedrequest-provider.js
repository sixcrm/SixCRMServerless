const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const hashutilities = global.SixCRM.routes.include('lib', 'hash-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'hash-utilities.js');

module.exports = class AWSSignedRequestProvider {

	constructor() {

		this.https = require('https');

	}

	signedRequest(endpoint, body) {

		du.debug('Signed Request');

		return Promise.resolve()
			.then(() => this.buildSignedRequest(endpoint, body))
			.then((request_parameters) => this.executeRequest(request_parameters));

	}

	executeRequest(request_parameters) {

		du.debug('Execute Request');

		return new Promise((resolve, reject) => {

			let request = this.https.request(request_parameters, (response) => {

				var response_body = '';

				response.on('data', (chunk) => {
					response_body += chunk;
				});

				response.on('end', () => {

					var info = stringutilities.parseJSONString(response_body);

					var failedItems;
					var success;

					if (response.statusCode >= 200 && response.statusCode < 299) {

						failedItems = info.items.filter(function(x) {
							return x.index.status >= 300;
						});

						success = {
							"attemptedItems": info.items.length,
							"successfulItems": info.items.length - failedItems.length,
							"failedItems": failedItems.length
						};

					}

					var error = response.statusCode !== 200 || info.errors === true ? {
						"statusCode": response.statusCode,
						"responseBody": response_body
					} : null;

					return resolve({
						error: error,
						success: success,
						statusCode: response.statusCode,
						failedItems: failedItems
					});

				});

			}).on('error', (e) => {
				return reject(e);
			});

			request.end(request_parameters.body);

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
