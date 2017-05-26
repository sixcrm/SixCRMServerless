'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'TrackingInput',
    fields: () => ({
        id:					{ type: new GraphQLNonNull(GraphQLString) },
        affiliate:	{ type: new GraphQLNonNull(GraphQLString) },
        type:       { type: new GraphQLNonNull(GraphQLString) },
        body:       { type: new GraphQLNonNull(GraphQLString) }
    })
});
