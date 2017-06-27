'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
    name: 'merchantproviderprocessor',
    description: 'A merchant provider processor.',
    fields: () => ({
    	name: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The name of the merchant provider processor instance.',
    },
        id: {
            type: GraphQLString,
            description: 'The id of the merchant provider processor instance.',
        }
    }),
    interfaces: []
});
