'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
    name: 'AnalyticsPagination',
    description: 'Analytics Pagination',
    fields: () => ({
        limit: {
            type: new GraphQLNonNull(GraphQLString),
            description: '',
        },
        offset: {
            type: new GraphQLNonNull(GraphQLString),
            description: '',
        },
        order: {
            type: new GraphQLNonNull(GraphQLString),
            description: '',
        },
        count: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        }
    }),
    interfaces: []
});
