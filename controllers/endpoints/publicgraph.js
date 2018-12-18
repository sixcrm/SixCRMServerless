
const _ = require('lodash');
const graphql = require('graphql').graphql;

const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

const publicController = global.SixCRM.routes.include('controllers', 'endpoints/components/public.js');
const resolveController = global.SixCRM.routes.include('providers', 'Resolve.js');
const auroraContext = require('@6crm/sixcrmcore/util/analytics/aurora-context').default;

module.exports = class PublicGraphController extends publicController {

	constructor() {

		super();

		//Technical Debt:  Instead of using a new schema, combine the schemas and prune here.
		this.sixSchema = global.SixCRM.routes.include('handlers', 'endpoints/publicgraph/schema');

		this.resolveController = new resolveController();

	}

	preamble() {
		global.SixCRM.setResource('auroraContext', auroraContext);
		return auroraContext.init();

	}

	body(event) {
		return this.preprocessing(event)
			.then((event) => this.parseEventQueryString(event))
			.then((event) => this.acquireQuery(event))
			.then((event) => this.acquireOutputParameters(event))
			.then((event) => this.setCacheParameters(event))
			.then((event) => this.graphQuery(event))
			.then((response) => this.handleGraphErrors(response));

	}

	epilogue() {
		global.SixCRM.getResource('auroraContext');
		return auroraContext.dispose();

	}


	parseEventQueryString(event) {
		return super.parseEventQueryString(event).then(event => {

			if (_.has(event, 'queryStringParameters')) {
				this.queryString = event.queryStringParameters;
			}

			return event;

		});

	}

	setCacheParameters(event) {
		if (_.has(this.queryString, 'use_cache')) {

			this.resolveController.setCacheParameters({use_cache: this.queryString.use_cache});

		}

		return Promise.resolve(event);

	}

	acquireOutputParameters(event) {
		if (_.has(this, 'queryString') && _.has(this.queryString, 'download') && !_.isNull(this.queryString.download)) {

			this.resolveController.setDownloadParameters({type: this.queryString.download});

		}

		return Promise.resolve(event);

	}

	acquireQuery(event) {
		this.query = this.sanitizeQuery(event.body);

		return Promise.resolve(event);

	}

	//Technical Debt:  This is largely inadequate...
	sanitizeQuery(query) {
		return query.replace(/[\n\r\t]+/g, '');

	}

	graphQuery() {
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
