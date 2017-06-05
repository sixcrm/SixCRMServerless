'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
    name: 'activityType',
    description: 'A record denoting customer activity.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        datetime: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        actor: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        actor_type: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        action: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        acted_upon: {
            type: GraphQLString,
            description: ''
        },
        acted_upon_type: {
            type: GraphQLString,
            description: ''
        },
        associated_with: {
            type: GraphQLString,
            description: ''
        },
        associated_with_type: {
            type: GraphQLString,
            description: ''
        },
        english:{
            type: new GraphQLNonNull(GraphQLString),
            description: 'An object containin all of the hydrated models as well as a english readable string template for parsing.'
        }
    }),
    interfaces: []
});
