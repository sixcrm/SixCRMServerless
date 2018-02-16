'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'AnalyticsActivityFilterInput',
    fields: () => ({
        start: {
            description: '',
            type: new GraphQLNonNull(GraphQLString)
        },
        end: {
            description: '',
            type: new GraphQLNonNull(GraphQLString)
        },
        actor:{
            description: '',
            type: new GraphQLList(GraphQLString)
        },
        actor_type:{
            description: '',
            type: new GraphQLList(GraphQLString)
        },
        action:{
            description: '',
            type: new GraphQLList(GraphQLString)
        },
        acted_upon:{
            description: '',
            type: new GraphQLList(GraphQLString)
        },
        acted_upon_type:{
            description: '',
            type: new GraphQLList(GraphQLString)
        },
        associated_with:{
            description: '',
            type: new GraphQLList(GraphQLString)
        },
        associated_with_type:{
            description: '',
            type: new GraphQLList(GraphQLString)
        }
    })
});
