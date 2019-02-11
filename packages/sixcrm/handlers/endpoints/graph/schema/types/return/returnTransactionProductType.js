const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLNonNull,
	GraphQLInt,
	GraphQLList
} = require('graphql');
const { getProductSetupService, LegacyProduct} = require('@6crm/sixcrm-product-setup');
const productType = require('../product/productType');
const returnHistoryType = require('./returnHistoryType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'returnTransactionProductType',
	description: 'A return transaction product.',
	fields: () => ({
		alias: {
			type: new GraphQLNonNull(GraphQLString)
		},
		product:{
			type: new GraphQLNonNull(productType.graphObj),
			resolve: async ({ product: productId }) => {
				const product = await getProductSetupService().getProduct(productId);
				return {
					...LegacyProduct.fromProduct(product),
					...product
				};
			}
		},
		quantity:{
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The number of items of this type returned'
		},
		history:{
			type: new GraphQLNonNull(new GraphQLList(returnHistoryType.graphObj)),
			description: 'The product return history'
		}
	}),
	interfaces: []
});
