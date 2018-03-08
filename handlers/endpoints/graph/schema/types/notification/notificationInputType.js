'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'NotificationInput',
    fields: () => ({
        id:			{ type: GraphQLString },
        user:		{ type: new GraphQLNonNull(GraphQLString) },
        account:	{ type: new GraphQLNonNull(GraphQLString) },
        title:   	{ type: new GraphQLNonNull(GraphQLString) },
        type: 	    { type: new GraphQLNonNull(GraphQLString) },
        category:   { type: GraphQLString },
        action: 	{ type: new GraphQLNonNull(GraphQLString) },
        body:	    { type: new GraphQLNonNull(GraphQLString) },
        expires_at:	{ type: GraphQLString },
        read_at:	{ type: GraphQLString },
        updated_at: { type: GraphQLString }
    })
});
