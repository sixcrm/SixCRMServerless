'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionsByAffiliateGroupType',
    description: 'Transactions by Affiliate Grou[]',
    fields: () => ({
        affiliate: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The affiliate identifier',
        },
        count: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The affiliate transaction count',
        },
        percentage: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The affiliate transaction percentage',
        }
    }),
    interfaces: []
});
