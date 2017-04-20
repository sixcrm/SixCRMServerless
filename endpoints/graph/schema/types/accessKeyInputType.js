'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'AccessKeyInput',
    fields: () => ({
        id:					{ type: new GraphQLNonNull(GraphQLString) },
        access_key:			{ type: new GraphQLNonNull(GraphQLString) },
        secret_key:			{ type: new GraphQLNonNull(GraphQLString) }
    })
});
