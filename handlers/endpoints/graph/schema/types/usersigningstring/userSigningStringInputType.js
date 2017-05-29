'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'UserSigningStringInput',
    fields: () => ({
        id:			    { type: new GraphQLNonNull(GraphQLString) },
        user:	        { type: new GraphQLNonNull(GraphQLString) },
        name:	        { type: new GraphQLNonNull(GraphQLString) },
        signing_string:	{ type: new GraphQLNonNull(GraphQLString) }
    })
});
