'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'MerchantProviderInput',
    fields: () => ({
        id:					{ type: GraphQLString },
        name:				{ type: new GraphQLNonNull(GraphQLString) },
        username:			{ type: new GraphQLNonNull(GraphQLString) },
        password:			{ type: new GraphQLNonNull(GraphQLString) },
        endpoint:			{ type: new GraphQLNonNull(GraphQLString) },
        processor:			{ type: new GraphQLNonNull(GraphQLString) }
    })
});
