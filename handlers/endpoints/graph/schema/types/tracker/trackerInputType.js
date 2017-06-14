'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'TrakerInput',
    fields: () => ({
        id:					{ type: new GraphQLNonNull(GraphQLString) },
        affiliates:	{ type: new GraphQLList(GraphQLString) },
        type:       { type: new GraphQLNonNull(GraphQLString) },
        event_type: { type: new GraphQLList(GraphQLString) },
        body:       { type: new GraphQLNonNull(GraphQLString) },
        name:       { type: GraphQLString }
    })
});
