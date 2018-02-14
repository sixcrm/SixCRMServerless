'use strict';
const _  = require('underscore');
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

const shippingReceiptController = global.SixCRM.routes.include('controllers', 'entities/ShippingReceipt.js');
const transactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');

let productType = require('../product/productType');
let shippingReceiptType = require('../shippingreceipt/shippingReceiptType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'transactionproduct',
    description: 'A product associated with a transaction.',
    fields: () => ({
      quantity:{
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
        resolve: function(transactionproduct){
  	       return transactionController.getProduct(transactionproduct.product);
        }
      },
      shippingreceipt: {
          type: shippingReceiptType.graphObj,
          description: 'A shipping receipt associated with the transaction product.',
          resolve: function(transactionproduct){
            if(!_.has(transactionproduct, "shippingreceipt")){ return null; }
            return shippingReceiptController.get({id: transactionproduct.shippingreceipt});
          }
      }
    }),
    interfaces: []
});
