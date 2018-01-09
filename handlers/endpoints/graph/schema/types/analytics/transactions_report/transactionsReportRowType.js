'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const customerType = require('./../../customer/customerType');
const merchantProviderType = require('./../../merchantprovider/merchantProviderType');
const campaignType = require('./../../campaign/campaignType');
const affiliateType = require('./../../affiliate/affiliateType');

const campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');
const merchantProviderController = global.SixCRM.routes.include('controllers', 'entities/MerchantProvider.js');
const affiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');
const customerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionsReportRowType',
    description: 'Transactions Report Row',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The id of the transaction.'
      },
      datetime: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'ISO8601 datetime when the entity was updated.'
      },
      customer: {
        type: customerType.graphObj,
        description: 'Customer associated with the transaction.',
        resolve: (row) => {
          return customerController.get({id: row.customer});
        }
      },
      merchant_provider: {
        type: merchantProviderType.graphObj,
        description: 'Merchant provider associated with the transaction.',
        resolve: row => merchantProviderController.get({id: row.merchant_provider})
      },
      campaign: {
        type: campaignType.graphObj,
        description: 'Campaign associated with the transaction.',
        resolve: row => campaignController.get({id: row.campaign})
      },
      affiliate: {
        type: affiliateType.graphObj,
        description: 'Affiliate associated with the transaction.',
        resolve: row => {
          if (!row.affiliate) {
            return null;
          }

          return affiliateController.get({id: row.affiliate})
        }
      },
      amount: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The amount of the transaction.',
      },
      processor_result: {
        type: new GraphQLNonNull(GraphQLString),
        description: '',
      },
      transaction_type: {
        type: new GraphQLNonNull(GraphQLString),
        description: '',
      },
      cycle: {
        type: GraphQLString,
        description: '',
      },
      recycle:{
        type: GraphQLString,
        description: '',
      },
      gateway_response: {
        type: GraphQLString,
        description: '',
      },
      transaction_id_gateway: {
        type: GraphQLString,
        description: '',
      }
    }),
    interfaces: []
});
