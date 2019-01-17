import * as _ from 'lodash';

// Technical Debt:  This adds a lot of time.
import * as request from 'request';
import * as querystring from 'querystring';

import du from '../util/debug-utilities';
import objectutilities from '../util/object-utilities';

type RequestOptions = (request.UriOptions & request.CoreOptions) | (request.UrlOptions & request.CoreOptions);

export default class HTTPProvider {

	post(parameters) {

		du.debug('Post');

		let request_options: any = {
			method: 'post'
		};

		request_options = objectutilities.transcribe(
			{
				url: 'endpoint'
			},
			parameters,
			request_options
		);

		request_options = objectutilities.transcribe(
			{
				headers: 'headers',
				body: 'body',
				url: 'url',
				json: 'json'
			},
			parameters,
			request_options,
			false
		);

		return this.resolveRequest(request_options);

	}

	postJSON(parameters) {

		du.debug('Post JSON');

		let request_options: any = {
			json: true
		};

		request_options = objectutilities.transcribe(
			{
				url: 'endpoint'
			},
			parameters,
			request_options
		);

		request_options = objectutilities.transcribe(
			{
				headers: 'headers',
				body: 'body',
				url: 'url'
			},
			parameters,
			request_options,
			false
		);

		if (!_.has(request_options, 'headers')) {
			request_options.headers = [];
		}

		request_options.headers['Content-Type'] = 'application/json';

		return this.post(request_options);

	}

	getJSON(parameters) {

		du.debug('Get');

		let request_options: any = {
			method: 'get',
			json: true
		};

		request_options = objectutilities.transcribe(
			{
				url: 'endpoint'
			},
			parameters,
			request_options
		);

		request_options = objectutilities.transcribe(
			{
				headers: 'headers',
				qs: 'querystring',
				url: 'url'
			},
			parameters,
			request_options,
			false
		);

		return this.resolveRequest(request_options);

	}

	resolveRequest(request_options: RequestOptions) {

		du.debug('Resolve Request');

		return new Promise((resolve, reject) => {

			request(request_options, (error, response, body) => {

				const response_object = {
					error,
					response,
					body
				};

				if (error) {

					du.error(error);
					reject(response_object);

				} else {

					resolve(response_object);

				}

			});

		});

	}

	createQueryString(parameters_object: object) {

		du.debug('Create Querystring');

		objectutilities.isObject(parameters_object, true);

		return querystring.stringify(parameters_object);

	}

}
