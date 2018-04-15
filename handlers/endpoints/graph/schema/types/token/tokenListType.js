
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLJSON = require('graphql-type-json');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Tokens',
	description: 'Tokens',
	fields: () => ({
		tokens: {
			type: new GraphQLNonNull(GraphQLJSON),
			description: 'The Event Tokens',
		}
	}),
	interfaces: []
});
