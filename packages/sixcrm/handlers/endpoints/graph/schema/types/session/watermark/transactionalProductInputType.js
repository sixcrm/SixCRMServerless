const {
	GraphQLInputObjectType,
	GraphQLNonNull,
	GraphQLFloat,
	GraphQLInt,
	GraphQLBoolean,
	GraphQLString
} = require('graphql');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'TransactionalProductInput',
	description: 'A transactional product.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the product.',
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the product.',
		},
		description: {
			type: GraphQLString,
			description: 'The product description.',
		},
		sku: {
			type: GraphQLString,
			description: 'The product SKU',
		},
		ship: {
			type: GraphQLBoolean,
			description: 'The product ship, no-ship status.',
		},
		shipping_delay: {
			type: GraphQLInt,
			description: 'The number of seconds to delay shipping after a transaction.',
		},
		default_price: {
			type: GraphQLFloat,
			description: 'A default price for product.',
		},
		merchantprovidergroup:{
			type: GraphQLString,
			description: 'The merchant provider group associated with the product schedule.'
		},
		fulfillment_provider: {
			type: GraphQLString,
			description: 'The session associated with the transaction.'
		}
	}),
	interfaces: []
});
