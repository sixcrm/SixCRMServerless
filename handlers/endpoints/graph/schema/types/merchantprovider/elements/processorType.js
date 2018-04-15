const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'merchantproviderprocessor',
	description: 'A merchant provider processor.',
	fields: () => ({
		name: {
			type: GraphQLString,
			description: 'The name of the merchant provider processor (bank name).',
		}
	}),
	interfaces: []
});
