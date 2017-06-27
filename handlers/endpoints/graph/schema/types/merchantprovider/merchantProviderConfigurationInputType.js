'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'MerchantProviderConfigutationInputType',
    fields: () => ({
        id:	{
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
        distribution:	{
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        }
    })
});
