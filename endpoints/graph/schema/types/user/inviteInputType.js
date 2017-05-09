'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'inviteInput',
    fields: () => ({
        token:		{ type: new GraphQLNonNull(GraphQLString) },
        parameters:	{ type: new GraphQLNonNull(GraphQLString) }
    })
});
