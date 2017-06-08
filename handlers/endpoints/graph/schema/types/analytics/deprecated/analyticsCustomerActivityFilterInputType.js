'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLInt = require('graphql').GraphQLInt;

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
