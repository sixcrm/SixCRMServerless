'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const transactionsByAffiliateGroupType = require('./transactionsByAffiliateGroupType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionsByAffiliateType',
    description: 'Transactions by Affiliate',
    fields: () => ({
        count: {
            type: GraphQLInt,
            description: 'Placeholder',
        },
        affiliates:{
            type: new GraphQLList(transactionsByAffiliateGroupType.graphObj),
            description: 'The affiliates'
        }
    }),
    interfaces: []
});
