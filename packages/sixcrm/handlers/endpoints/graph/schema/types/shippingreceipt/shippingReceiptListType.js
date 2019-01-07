
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let paginationType = require('../pagination/paginationType');
let shippingReceiptType = require('./shippingReceiptType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'ShippingReceipts',
	description: 'Receipts from shipping',
	fields: () => ({
		shippingreceipts: {
			type: new GraphQLList(shippingReceiptType.graphObj),
			description: 'The shipping receipts',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
