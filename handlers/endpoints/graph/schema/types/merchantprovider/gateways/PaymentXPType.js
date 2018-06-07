const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let GatewayInterfaceType = require('./gatewayType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'PaymentXP',
	description: 'A PaymentXP gateway.',
	interfaces: [GatewayInterfaceType.graphObj],
	fields: () => ({
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the merchant provider gateway name.'
		},
		type: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the provider gateway'
			//Technical Debt:  Enumerate
		},
		username: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The PaymentXP username.'
		},
		password: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The PaymentXP password.'
		},
		merchant_id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The PaymentXP merchant id.'
		},
		merchant_key: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The PaymentXP merchant key.'
		}
	})
});
