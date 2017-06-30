'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'AnalyticsPaginationInput',
    fields: () => ({
        limit: {
            type: GraphQLInt,
            description: 'The maximum number of results to return'
        },
        order: {
            type: GraphQLString,
            description: 'The order to return the results as defined by the underlying query'
        },
        offset: {
            type: GraphQLInt,
            description: 'The record offset'
        }
    })
});
