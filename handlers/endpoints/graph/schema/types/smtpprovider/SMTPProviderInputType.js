'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'SMTPProviderInput',
    fields: () => ({
        id:					{ type: new GraphQLNonNull(GraphQLString) },
        name:				{ type: new GraphQLNonNull(GraphQLString) },
        hostname:			{ type: new GraphQLNonNull(GraphQLString) },
        username:			{ type: new GraphQLNonNull(GraphQLString) },
        password:			{ type: new GraphQLNonNull(GraphQLString) },
        port:				{ type: GraphQLInt }
    })
});
