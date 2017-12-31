'use strict';
const _ = require('underscore');
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;

let shippingReceiptHistoryElementType = require('./elements/historyElementType');
let fulfillmentProviderType = require('../fulfillmentprovider/fulfillmentProviderType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'shippingreceipt',
    description: 'A shipping receipt.',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The id of the shipping receipt.',
      },
      status: {
        type: GraphQLString,
        description: 'A shipping status',
      },
      trackingnumber: {
        type: GraphQLString,
        description: 'A tracking number for the shipment',
      },
      fulfillment_provider: {
        type: fulfillmentProviderType.graphObj,
        description:"The fulfillment provider associated with the shipping receipt",
        resolve: (shipping_receipt) => {
          let shippingReceiptController = global.SixCRM.routes.include('controllers', 'entities/ShippingReceipt.js');

          return shippingReceiptController.getFulfillmentProvider(shipping_receipt);
        }
      },
      fulfillment_provider_reference:{
        type: GraphQLString,
        description:  'The fulfillment provider specific identifier that corresponds the the fulfillment order.'
      },
      history:{
        type: new GraphQLList(shippingReceiptHistoryElementType.graphObj),
        description: 'History records corresponding to the shipping receipt.'
      },
      created_at: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'ISO8601 datetime when the entity was created.',
      },
      updated_at: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'ISO8601 datetime when the entity was updated.',
      }
    }),
    interfaces: []
});
