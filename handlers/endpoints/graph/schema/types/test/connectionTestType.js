const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const connectionTestResultType = require('./connectionTestResultType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'ConnectionTest',
	description: 'Connection Test',
	fields: () => ({
		elasticsearch: {
			type: new GraphQLNonNull(connectionTestResultType.graphObj),
			description: 'Elasticsearch Connectivity Test',
			resolve: () => {
				const ElasticSearchProvider = global.SixCRM.routes.include('providers', 'elasticsearch-provider.js');
				const elasticSearchProvider = new ElasticSearchProvider();
				return elasticSearchProvider.test();
			}
		},
		dynamodb: {
			type: new GraphQLNonNull(connectionTestResultType.graphObj),
			description: 'DynamoDB Connectivity Test',
			resolve: () => {
				const DynamoDBProvider = global.SixCRM.routes.include('providers', 'dynamodb-provider.js');
				const dynamoDBProvider = new DynamoDBProvider();
				return dynamoDBProvider.test();
			}
		},
		cloudsearch: {
			type: new GraphQLNonNull(connectionTestResultType.graphObj),
			description: 'Cloudsearch Connectivity Test',
			resolve: () => {
				const CloudsearchProvider = global.SixCRM.routes.include('providers', 'cloudsearch-provider.js');
				const cloudsearchProvider = new CloudsearchProvider(true);
				return cloudsearchProvider.test();
			}
		},
		aurora: {
			type: new GraphQLNonNull(connectionTestResultType.graphObj),
			description: 'Aurora Connectivity Test',
			resolve: () => {
				const PostgresContext = require('@6crm/sixcrmcore/util/analytics/postgres-context').default;
				const postgresContext = new PostgresContext('aurora');
				return postgresContext.init().then(() => postgresContext.testConnection());
			}
		}
		/*
		redshift: {
			type: new GraphQLNonNull(connectionTestResultType.graphObj),
			description: 'Redshift Connectivity Test',
			resolve: () => {
				const RDSProvider = global.SixCRM.routes.include('providers', 'rds-provider.js');
				const rDSProvider = new RDSProvider();
				return rDSProvider.test();
			}
		},
		*/
	}),
	interfaces: []
});
