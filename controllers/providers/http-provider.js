
const _ = require('lodash');

//Technical Debt:  This adds a lot of time.
const request = require('request');
const querystring = require('querystring');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

module.exports = class HTTPProvider {

	constructor(){

	}

	removeIrrelevantFields(response){

		du.debug('Remoce Irrelevant Fields');

		response = objectutilities.transcribe(
			{
				statusCode: 'statusCode',
				statusMessage: 'statusMessage',
				body: 'body'
			},
			response,
			{},
			false
		);

		return response;

	}

	post(parameters){

		du.debug('Post');

		let request_options = {
			method: 'post'
		};

		request_options = objectutilities.transcribe(
			{
				url:'endpoint'
			},
			parameters,
			request_options
		);

		request_options = objectutilities.transcribe(
			{
				headers:'headers',
				body:'body',
				url: 'url',
				json: 'json'
			},
			parameters,
			request_options,
			false
		);

		return this.resolveRequest(request_options);

	}

	postJSON(parameters){

		du.debug('Post JSON');

		let request_options = {
			json: true
		};

		request_options = objectutilities.transcribe(
			{
				url:'endpoint'
			},
			parameters,
			request_options
		);

		request_options = objectutilities.transcribe(
			{
				headers:'headers',
				body:'body',
				url: 'url'
			},
			parameters,
			request_options,
			false
		);

		if(!_.has(request_options, 'headers')){
			request_options.headers = [];
		}

		request_options.headers['Content-Type'] = 'application/json';

		return this.post(request_options);

	}

	getJSON(parameters){

		du.debug('Get');

		let request_options = {
			method: 'get',
			json: true
		};

		request_options = objectutilities.transcribe(
			{
				url:'endpoint'
			},
			parameters,
			request_options
		);

		request_options = objectutilities.transcribe(
			{
				headers:'headers',
				qs:'querystring',
				url: 'url'
			},
			parameters,
			request_options,
			false
		);

		return this.resolveRequest(request_options);

	}

	resolveRequest(request_options){

		du.debug('Resolve Request');

		return new Promise((resolve, reject) => {

			request(request_options, (error, response, body) => {

				let response_object = {
					error: error,
					response: response,
					body: body
				};

				if(error){

					du.error(error);
					reject(response_object);

				} else {

					resolve(response_object);

				}

			});

		});

	}

	createQueryString(parameters_object){

		du.debug('Create Querystring');

		objectutilities.isObject(parameters_object, true);

		return querystring.stringify(parameters_object);

	}

}
