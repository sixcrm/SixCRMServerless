'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const merchantProviderAmountGroupType = require('./merchantProviderAmountGroupType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'MerchantProviderAmountType',
    description: 'Merchant Provider Amounts',
    fields: () => ({
        merchant_providers: {
            type: new GraphQLList(merchantProviderAmountGroupType.graphObj),
            description: 'Placeholder',
        }
    }),
    interfaces: []
});
