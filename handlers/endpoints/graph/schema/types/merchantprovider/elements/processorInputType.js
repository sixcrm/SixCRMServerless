'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'MerchantProviderProcessorInput',
    fields: () => ({
        name: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The name of the merchant provider processor instance.',
        },
        id: {
            type: GraphQLString,
            description: 'The id of the merchant provider processor instance.',
        }
    })
});
