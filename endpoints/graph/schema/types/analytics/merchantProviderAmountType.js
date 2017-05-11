'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
    name: 'MerchantProviderAmountType',
    description: 'Merchant Provider Amounts',
    fields: () => ({
        hello: {
            type: GraphQLString,
            description: 'Placeholder',
        }
    }),
    interfaces: []
});
