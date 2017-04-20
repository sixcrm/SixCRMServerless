'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'FulfillmentProviderInput',
    fields: () => ({
        id:					{ type: new GraphQLNonNull(GraphQLString) },
        name:				{ type: new GraphQLNonNull(GraphQLString) },
        username:			{ type: new GraphQLNonNull(GraphQLString) },
        password:			{ type: new GraphQLNonNull(GraphQLString) },
        endpoint:			{ type: new GraphQLNonNull(GraphQLString) },
        provider:			{ type: new GraphQLNonNull(GraphQLString) }
    })
});
