'use strict';
const shippingReceiptController = require('../../../../controllers/ShippingReceipt.js');
const _  = require('underscore');
const transactionController = require('../../../../controllers/Transaction.js');
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
let productType = require('./productType');
let shippingReceiptType = require('./shippingReceiptType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'transactionproduct',
    description: 'A product associated with a transaction.',
    fields: () => ({
        amount: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The amount of the product.',
        },
        product: {
            type: productType.graphObj,
            description: 'The product.',
            resolve: function(transactionproduct){
      	return transactionController.getProduct(transactionproduct.product);
            }
        },
        shippingreceipt: {
	    type: shippingReceiptType.graphObj,
	    description: 'A shipping receipt associated with the transaction product.',
	    resolve: function(transactionproduct){
        if(!_.has(transactionproduct, "shippingreceipt")){ return null; }
	      return shippingReceiptController.get(transactionproduct.shippingreceipt);
	    }
        }
    }),
    interfaces: []
});
