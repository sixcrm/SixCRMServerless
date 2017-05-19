'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
    name: 'NotificationTest',
    description: 'Send a test notification.',
    fields: () => ({
        result: {
            type: GraphQLString,
            description: 'OK',
        }
    }),
    interfaces: []
});
