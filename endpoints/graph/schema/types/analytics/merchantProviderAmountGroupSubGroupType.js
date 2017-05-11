'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;


module.exports.graphObj = new GraphQLObjectType({
    name: 'MerchantProviderAmountGroupSubGroupType',
    description: 'The Merchant Provider Group Sub Group ',
    fields: () => ({
        count:{
            type: new GraphQLNonNull(GraphQLString),
            description: 'The merchant provider subgroup count'
        },
        amount:{
            type: new GraphQLNonNull(GraphQLString),
            description: 'The merchant provider subgroup amount'
        }
    }),
    interfaces: []
});
