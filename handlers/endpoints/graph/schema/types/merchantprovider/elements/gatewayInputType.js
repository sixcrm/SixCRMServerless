'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'MerchantProviderGatewayInput',
    fields: () => ({
        name: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The name of the merchant provider gateway name.',
        },
        username: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The name of the merchant provider gateway username.',
        },
        password: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The name of the merchant provider gateway password.',
        },
        endpoint: {
            type: GraphQLString,
            description: 'The name of the merchant provider gateway endpoint.',
        },
        processor_id: {
            type: GraphQLString,
            description: 'The merchant provider processor_id.',
        },
        additional:{
            type: GraphQLString,
            description: 'Additional properties associated with the merchant provider gateway.'
        }
    })
});
