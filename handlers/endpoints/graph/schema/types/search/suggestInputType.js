'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'SuggestInput',
    fields: () => ({
        query:					{ type: new GraphQLNonNull(GraphQLString) },
        suggester:				{ type: new GraphQLNonNull(GraphQLString) },
        size:					{ type: GraphQLString }
    })
});
