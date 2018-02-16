'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'AnalyticsCustomerActivityFilterInput',
    fields: () => ({
        start: {
            description: '',
            type: new GraphQLNonNull(GraphQLString)
        },
        end: {
            description: '',
            type: new GraphQLNonNull(GraphQLString)
        },
        customer: {
            description: 'The customer identifier.',
            type: new GraphQLNonNull(GraphQLString)
        },
    })
});
