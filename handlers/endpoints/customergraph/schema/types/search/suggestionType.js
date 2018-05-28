
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
	name: 'Suggestion',
	description: 'A Suggestion.',
	fields: () => ({
		suggestion: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The suggestion string',
		},
		score: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The number of Search Results found that match the suggestion query',
		},
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id associated with the suggestion.',
		}
	}),
	interfaces: []
});
