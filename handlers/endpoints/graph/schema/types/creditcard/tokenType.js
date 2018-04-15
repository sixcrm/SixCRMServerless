
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'CreditCardToken',
	description: 'A creditcard token object',
	fields: () => ({
		token: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The token',
		},
		provider: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The token provider',
		}
	}),
	interfaces: []
});
