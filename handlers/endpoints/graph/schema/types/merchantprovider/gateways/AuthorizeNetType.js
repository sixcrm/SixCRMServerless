const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let GatewayInterfaceType = require('./gatewayType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'AuthorizeNet',
	description: 'An AuthorizeNet gateway.',
	interfaces: [GatewayInterfaceType.graphObj],
	fields: () => ({
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the merchant provider gateway name.',
		},
		type: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the provider gateway'
			//Technical Debt:  Enumerate
		},
		api_key: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The AuthorizeNet API Key.',
		},
		transaction_key: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The AuthorizeNet Transaction Key.',
		},
		processor: {
			type: GraphQLString,
			description: 'The merchant provider processor.',
		},
		midnumber: {
			type: GraphQLString,
			description: 'The merchant provider midnumber.',
		},
		descriptor: {
			type: GraphQLString,
			description: 'The merchant provider descriptor.',
		}
	})
});
