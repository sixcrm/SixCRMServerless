'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionOverviewGroupResponseType',
    description: 'Transaction overview group response',
    fields: () => ({
        count: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The numerical count.'
        },
        amount: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The sum amount.'
        }
    }),
    interfaces: []
});
