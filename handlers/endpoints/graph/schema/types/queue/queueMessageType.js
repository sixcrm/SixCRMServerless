'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
    name: 'queueMessageType',
    description: 'A message in a queue.',
    fields: () => ({
        id: {
            type: GraphQLString,
            description: 'ID of a message'
        },
        message: {
            type: GraphQLString,
            description: 'Content of a message'
        }
    }),
    interfaces: []
});
