
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;

module.exports.graphObj = new GraphQLObjectType({
	name: 'AnalyticsPagination',
	description: 'Analytics Pagination',
	fields: () => ({
		limit: {
			type: new GraphQLNonNull(GraphQLInt),
			description: '',
		},
		offset: {
			type: new GraphQLNonNull(GraphQLInt),
			description: '',
		},
		order: {
			type: new GraphQLNonNull(GraphQLString),
			description: '',
		},
		count: {
			type: new GraphQLNonNull(GraphQLInt),
			description: ''
		}
	}),
	interfaces: []
});
