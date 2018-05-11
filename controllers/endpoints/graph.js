
const _ = require('lodash');
const graphql = require('graphql').graphql;

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const authenticatedController = global.SixCRM.routes.include('controllers', 'endpoints/components/authenticated.js');
const resolveController = global.SixCRM.routes.include('providers', 'Resolve.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context.js');

module.exports = class graphController extends authenticatedController {

	constructor() {

		super();

		this.sixSchema = global.SixCRM.routes.include('handlers', 'endpoints/graph/schema');

		this.resolveController = new resolveController();

	}

	preamble() {

		du.debug('GraphController.preamble()');

		global.SixCRM.setResource('auroraContext', auroraContext);

		return auroraContext.init();

	}

	body(event) {

		du.debug('GraphController.body()');

		return this.preprocessing(event)
			.then((event) => this.parseEventQueryString(event))
			.then((event) => this.acquireQuery(event))
			.then((event) => this.acquireOutputParameters(event))
			.then((event) => this.setCacheParameters(event))
			.then((event) => this.graphQuery(event))
			.then((response) => this.handleGraphErrors(response));

	}

	epilogue() {

		du.debug('GraphController.epilogue()');

		global.SixCRM.getResource('auroraContext');
		return auroraContext.dispose();

	}


	parseEventQueryString(event) {

		du.debug('Parse Event Query String');

		return super.parseEventQueryString(event).then(event => {

			if (_.has(event, 'queryStringParameters')) {
				this.queryString = event.queryStringParameters;
			}

			return event;

		});

	}

	setCacheParameters(event) {

		du.debug('Set Cache Parameters');

		if (_.has(this.queryString, 'use_cache')) {

			this.resolveController.setCacheParameters({use_cache: this.queryString.use_cache});

		}

		return Promise.resolve(event);

	}

	acquireOutputParameters(event) {

		du.debug('Acquire Output Parameters');

		if (_.has(this, 'queryString') && _.has(this.queryString, 'download') && !_.isNull(this.queryString.download)) {

			this.resolveController.setDownloadParameters({type: this.queryString.download});

		}

		return Promise.resolve(event);

	}

	acquireQuery(event) {

		du.debug('Acquire Query');

		this.query = this.sanitizeQuery(event.body);

		return Promise.resolve(event);

	}

	//Technical Debt:  This is largely inadequate...
	sanitizeQuery(query) {

		du.debug('Sanitize Query');

		return query.replace(/[\n\r\t]+/g, '');

	}

	graphQuery() {

		du.debug('Graph Query');

		let graph_resolver = () => {

			return graphql(this.sixSchema, this.query, null, null, this.query_parameters);

		};

		return this.resolveController.resolve(graph_resolver);

	}

	handleGraphErrors(response) {

		if (_.has(response, 'errors') && _.isArray(response.errors) && response.errors.length > 0) {

			let graph_error = response.errors[0];

			let error_name = graph_error.stack.substring(0, graph_error.stack.indexOf(':'));

			let correct_error = eu.getErrorByName(error_name);

			if (_.isError(correct_error)) {

				if (_.has(graph_error, "message")) {
					correct_error.message = graph_error.message;
				}

				throw correct_error;

			}

			throw graph_error;

		}

		return response;

	}

}
