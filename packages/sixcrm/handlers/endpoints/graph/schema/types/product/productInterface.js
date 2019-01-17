
const GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let productType = require('./productType');

module.exports.graphObj = new GraphQLInterfaceType({
	name: 'product',
	description: 'A product',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the product.',
		},
		name: {
			type: GraphQLString,
			description: 'The name of the product.',
		},
		sku: {
			type: GraphQLString,
			description: 'The SKU of the product.',
		}
	}),
	resolveType(/*product*/) {
		return productType.graphObj;
	}
});
