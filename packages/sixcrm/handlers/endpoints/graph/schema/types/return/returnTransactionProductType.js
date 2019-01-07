
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLList = require('graphql').GraphQLList;

const productType = require('../product/productType');
const ProductController = global.SixCRM.routes.include('entities', 'Product');

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
			resolve:(product) => {
				let productController = new ProductController();
				return productController.get({id: product.product});
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
