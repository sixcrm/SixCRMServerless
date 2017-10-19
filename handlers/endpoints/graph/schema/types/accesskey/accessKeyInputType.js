'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'AccessKeyInput',
    fields: () => ({
        id:					{ type: GraphQLString },
        name:			  { type: GraphQLString },
        notes:			{ type: GraphQLString }
    })
});
