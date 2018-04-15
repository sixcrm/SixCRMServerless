const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'SearchInput',
	fields: () => ({
		query: {
			type: new GraphQLNonNull(GraphQLString)
		},
		cursor: {
			type: GraphQLString
		},
		expr: {
			type: GraphQLString
		},
		facet: {
			type: GraphQLString
		},
		filterQuery: {
			type: GraphQLString
		},
		highlight: {
			type: GraphQLString
		},
		partial: {
			type: GraphQLString
		},
		queryOptions: {
			type: GraphQLString
		},
		queryParser: {
			type: GraphQLString
		},
		return: {
			type: GraphQLString
		},
		size: {
			type: GraphQLString
		},
		sort: {
			type: GraphQLString
		},
		start: {
			type: GraphQLString
		},
		stats: {
			type: GraphQLString
		}
	})
});
