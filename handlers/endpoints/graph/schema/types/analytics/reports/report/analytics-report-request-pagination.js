const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports = new GraphQLInputObjectType({
	name: 'AnayticsReportRequestPagination',
	description: 'Pagination',
	fields: () => ({
		offset: {
			type: GraphQLInt
		},
		limit: {
			type: GraphQLInt,
		},
		order: {
			type: new GraphQLList(GraphQLString)
		},
		direction: {
			type: GraphQLString,
		}
	})
});
