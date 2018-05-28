
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
	name: 'SearchStatus',
	description: 'Search Result Hits.',
	fields: () => ({
		timems: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'Microsecond result time.',
		},
		rid: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The result ID.',
		}
	}),
	interfaces: []
});
