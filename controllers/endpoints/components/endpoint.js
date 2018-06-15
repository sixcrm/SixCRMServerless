
const _ = require('lodash');
const querystring = require('querystring');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const stringutilities = require('@sixcrm/sixcrmcore/util/string-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

module.exports = class EndpointController {

	constructor() {

		this.clearState();

	}

	/* lambda lifecycle */

	// run the lambda lifecycle
	execute(event) {

		du.debug('EndpointController.execute()');

		return this.preamble(event)
			.then(() => this.body(event))
			.then((res) => this.epilogue().then(() => Promise.resolve(res)))

	}

	// override
	// eslint-disable-next-line no-unused-vars
	preamble(event) {

		du.debug('EndpointController.preamble()');

		return Promise.resolve();

	}


	// override
	// eslint-disable-next-line no-unused-vars
	body(event) {

		du.debug('EndpointController.body()');

		return Promise.resolve();

	}

	// override
	epilogue() {

		du.debug('EndpointController.epilogue()');

		return Promise.resolve();

	}

	/* end lambda lifecycle */

	normalizeEvent(event) {

		du.debug('Normalize Event');

		let normalized = event;

		try {
			normalized = JSON.parse(event);
		} catch (error) {
			//do nothing
		}

		return Promise.resolve(normalized);

	}

	//Technical Debt:  This is gross.  Refactor!
	clearState() {

		du.debug('Clear State');

		this.pathParameters = undefined;
		this.queryString = undefined;

	}

	acquireRequestProperties(event) {

		du.debug('Acquire Request Properties');
		du.info(event);
		let path_parameters = this.acquirePathParameters(event);
		let body = this.acquireBody(event);
		let querystring_parameters = this.acquireQueryStringParameters(event);

		//Technical Debt:  What happens if there is namespace collision?
		let merged_properties = objectutilities.merge(path_parameters, body, querystring_parameters);

		return merged_properties;

	}

	acquireBody(event) {

		du.debug('Acquire Body');

		let return_object = {};

		if (_.has(event, 'body')) {

			if (objectutilities.isObject(event.body)) {

				return_object = event.body;

			} else if (stringutilities.isString(event.body)) {

				try {

					return_object = stringutilities.parseJSONString(event.body, true);

				} catch (e) {

					du.error(e);
					//Thing is not a sting or does not parse...

				}

			}

		}

		return return_object;

	}

	acquirePathParameters(event) {

		du.debug('Acquire Path Parameters');

		let return_object = {};

		if (_.has(event, 'pathParameters') && objectutilities.isObject(event.pathParameters)) {
			return_object = event.pathParameters;
		}

		return return_object;

	}

	acquireQueryStringParameters(event) {

		du.debug('Acquire Query String');

		let return_object = {};

		if (_.has(event, 'queryStringParameters')) {

			if (_.isObject(event.queryStringParameters)) {

				return_object = event.queryStringParameters;

			} else {

				try {

					return_object = querystring.parse(event.queryStringParameters);

				} catch (error) {

					//du.error(error);
					//this.throwUnexpectedEventStructureError(event);

				}

			}

		}

		return return_object;

	}


	validateEvent(event) {

		du.debug('Validate Event');


		try {
			global.SixCRM.validate(event, global.SixCRM.routes.path('model', 'general/lambda/event.json'));
		} catch (error) {
			du.error(error);
			this.throwUnexpectedEventStructureError(event);
		}

		return Promise.resolve(event);

	}

	parseEventQueryString(event) {

		du.debug('Parse Event Query String');

		return Promise.resolve().then(() => {
			if (!_.has(event, 'queryStringParameters') || _.isNull(event.queryStringParameters)) {
				return event;
			}

			if (_.isString(event.queryStringParameters)) {
				event.queryStringParameters = querystring.parse(event.queryStringParameters);
			}

			if (
				!_.isObject(event.queryStringParameters) ||
            _.isArray(event.queryStringParameters) ||
            _.isFunction(event.queryStringParameters)
			) {
				this.throwUnexpectedEventStructureError(event);
			}

			return event;
		});

	}

	throwUnexpectedEventStructureError(event) {

		du.debug('Throw Unexpected Event Structure Error');

		du.warning(event);

		throw eu.getError('bad_request', 'Unexpected event structure.');

	}

}
