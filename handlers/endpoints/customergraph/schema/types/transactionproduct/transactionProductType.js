const _ = require('lodash');
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
const TransactionController = global.SixCRM.routes.include('entities', 'Transaction.js');

let productType = require('../product/productType');
let shippingReceiptType = require('../shippingreceipt/shippingReceiptType');
let transactionProductReturnType = require('./transactionProductReturnType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'transactionproduct',
	description: 'A product associated with a transaction.',
	fields: () => ({
		quantity: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The quantity of the product sold.',
		},
		amount: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The amount of the product.',
		},
		product: {
			type: productType.graphObj,
			description: 'The product.',
			resolve: function (transactionproduct) {
				const transactionController = new TransactionController();
				return transactionController.getProduct(transactionproduct.product);
			}
		},
		shippingreceipt: {
			type: shippingReceiptType.graphObj,
			description: 'A shipping receipt associated with the transaction product.',
			resolve: function (transactionproduct) {
				if (!_.has(transactionproduct, "shippingreceipt")) {
					return null;
				}
				const shippingReceiptController = new ShippingReceiptController();
				return shippingReceiptController.get({
					id: transactionproduct.shippingreceipt
				});
			}
		},
		returns: {
			type: new GraphQLList(transactionProductReturnType.graphObj),
			description: 'Returns associated with the transaction product'
		}
	}),
	interfaces: []
});
