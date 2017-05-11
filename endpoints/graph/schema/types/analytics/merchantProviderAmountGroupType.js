'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const merchantProviderAmountGroupSubGroupType = require('./merchantProviderAmountGroupSubGroupType');


module.exports.graphObj = new GraphQLObjectType({
    name: 'MerchantProviderAmountGroupType',
    description: 'The Merchant Provider Group ',
    fields: () => ({
        id:{
            type: new GraphQLNonNull(GraphQLString),
            description: 'The merchant provider ID'
        },
        name:{
            type: new GraphQLNonNull(GraphQLString),
            description: 'The merchant provider name'
        },
        error:{
            type: new GraphQLNonNull(merchantProviderAmountGroupSubGroupType.graphObj),
            description: 'The merchant provider error transactions'
        },
        decline:{
            type: new GraphQLNonNull(merchantProviderAmountGroupSubGroupType.graphObj),
            description: 'The merchant provider decline'
        },
        success:{
            type: new GraphQLNonNull(merchantProviderAmountGroupSubGroupType.graphObj),
            description: 'The merchant provider success'
        }
    }),
    interfaces: []
});
