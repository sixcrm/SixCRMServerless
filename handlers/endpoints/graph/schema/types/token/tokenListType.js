'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLJSON = require('graphql-type-json');


module.exports.graphObj = new GraphQLObjectType({
    name: 'Tokens',
    description: 'Tokens',
    fields: () => ({
      tokens: {
        type: new GraphQLNonNull(GraphQLJSON),
        description: 'The Event Tokens',
      }
    }),
    interfaces: []
});
