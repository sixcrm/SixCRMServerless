
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'PaginationInput',
	fields: () => ({
		limit: {
			type: GraphQLString,
			description: 'The maximum number of results to return.'
		},
		cursor: {
			type: GraphQLString,
			description: 'The last evaluated identifier'
		},
		exclusive_start_key: {
			type: GraphQLString,
			description: 'A serialized JSON string which is the result from the last evaluated key from the previous query'
		}
	})
});
