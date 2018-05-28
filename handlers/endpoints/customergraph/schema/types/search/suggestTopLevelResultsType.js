
const GraphQLList = require('graphql').GraphQLList;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let suggestionType = require('./suggestionType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'SuggestTopLevelResults',
	description: 'Suggest Top Level Results.',
	fields: () => ({
		query: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Suggest Query',
		},
		found: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The number of Search Results found that match the suggestion query',
		},
		suggestions: {
			type: new GraphQLList(suggestionType.graphObj),
			description: 'The suggestions associated with the query',
		}
	}),
	interfaces: []
});
