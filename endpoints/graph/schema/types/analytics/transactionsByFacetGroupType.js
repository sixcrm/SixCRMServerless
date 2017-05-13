'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionsByFacetGroupType',
    description: 'Transactions by Facet Group',
    fields: () => ({
        facet: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The facet identifier',
        },
        count: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The facet event count',
        },
        percentage: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The facet event percentage',
        }
    }),
    interfaces: []
});
