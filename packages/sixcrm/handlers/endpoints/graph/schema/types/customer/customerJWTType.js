const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'CustomerJWT',
	description: 'A customer jwt.',
	fields: () => ({
		token: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The customer JWT',
		}
	}),
	interfaces: []
});
