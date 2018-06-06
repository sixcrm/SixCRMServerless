const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let GatewayInterfaceType = require('./gatewayType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Innovio',
	description: 'A Innovio gateway.',
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
		username: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the merchant provider gateway username.',
		},
		password: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the merchant provider gateway password.',
		},
		product_id: {
			type: GraphQLString,
			description: 'The name of the merchant provider gateway password.',
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
