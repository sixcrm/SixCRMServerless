
const _ = require('lodash');
const querystring = require('querystring');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;

module.exports = class EndpointController {

	constructor() {

		this.clearState();

	}

	/* lambda lifecycle */

	// run the lambda lifecycle
	execute(event, context) {
		return this.preamble(event, context)
			.then(() => this.body(event))
			.then((res) => this.epilogue().then(() => Promise.resolve(res)))

	}

	// override
	// eslint-disable-next-line no-unused-vars
	preamble(event) {
		return Promise.resolve();

	}


	// override
	// eslint-disable-next-line no-unused-vars
	body(event) {
		return Promise.resolve();

	}

	// override
	epilogue() {
		return Promise.resolve();

	}

	/* end lambda lifecycle */

	normalizeEvent(event) {
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
		this.pathParameters = undefined;
		this.queryString = undefined;

	}

	acquireRequestProperties(event) {
		du.info(event);
		let path_parameters = this.acquirePathParameters(event);
		let body = this.acquireBody(event);
		let querystring_parameters = this.acquireQueryStringParameters(event);

		//Technical Debt:  What happens if there is namespace collision?
		let merged_properties = objectutilities.merge(path_parameters, body, querystring_parameters);

		return merged_properties;

	}

	acquireBody(event) {
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
		let return_object = {};

		if (_.has(event, 'pathParameters') && objectutilities.isObject(event.pathParameters)) {
			return_object = event.pathParameters;
		}

		return return_object;

	}

	acquireQueryStringParameters(event) {
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
		try {
			global.SixCRM.validate(event, global.SixCRM.routes.path('model', 'general/lambda/event.json'));
		} catch (error) {
			du.error(error);
			this.throwUnexpectedEventStructureError(event);
		}

		return Promise.resolve(event);

	}

	parseEventQueryString(event) {
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
		du.warning(event);

		throw eu.getError('bad_request', 'Unexpected event structure.');

	}

}
