'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'AccountInput',
    fields: () => ({
        id:					{ type: GraphQLString },
        name:				{ type: new GraphQLNonNull(GraphQLString) },
        active:				{ type: new GraphQLNonNull(GraphQLBoolean) },
        updated_at: { type: GraphQLString }
    })
});
