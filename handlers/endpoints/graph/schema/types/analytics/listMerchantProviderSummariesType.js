'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const merchantProviderSummaryType = require('./merchantProviderSummaryType');
const analyticsPaginationType = require('./paginationType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'listMerchantProviderSummariesType',
    description: 'Merchant Provider Summary List',
    fields: () => ({
        merchantproviders: {
            type: new GraphQLList(merchantProviderSummaryType.graphObj),
            description: 'The merchant providers.',
        },
        pagination: {
            type: new GraphQLNonNull(analyticsPaginationType.graphObj),
            description: 'The analytics pagination object.',
        }
    }),
    interfaces: []
});
