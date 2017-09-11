'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

let merchantProviderConfigurationInputType = require('../merchantprovider/merchantProviderConfigurationInputType');

//Technical Debt:  Add name
module.exports.graphObj = new GraphQLInputObjectType({
    name: 'LoadBalancerInputType',
    fields: () => ({
        id:	{ type: GraphQLString },
        name:	{ type: GraphQLString },
        merchantproviders:	{ type: new GraphQLList(merchantProviderConfigurationInputType.graphObj) }
    })
});
