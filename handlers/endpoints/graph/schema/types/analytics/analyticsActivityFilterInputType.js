'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLInt = require('graphql').GraphQLInt;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'AnalyticsActivityFilterInput',
    fields: () => ({
        start: {
            description: 'The transaction summary start daytime.',
            type: new GraphQLNonNull(GraphQLString)
        },
        end: {
            description: 'The transaction summary start daytime.',
            type: new GraphQLNonNull(GraphQLString)
        },
        actor:{
            description: '',
            type: GraphQLString
        },
        actor_type:{
            description: '',
            type: GraphQLString
        },
        action:{
            description: '',
            type: GraphQLString
        },
        acted_upon:{
            description: '',
            type: GraphQLString
        },
        acted_upon_type:{
            description: '',
            type: GraphQLString
        },
        associated_with:{
            description: '',
            type: GraphQLString
        },
        associated_with_type:{
            description: '',
            type: GraphQLString
        }
    })
});
