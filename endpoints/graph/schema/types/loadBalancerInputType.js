'use strict';
let merchantProviderConfigurationInputType = require('./merchantProviderConfigurationInputType');
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'LoadBalancerInputType',
    fields: () => ({
        id:					{ type: new GraphQLNonNull(GraphQLString) },
        merchantproviders:	{ type: new GraphQLList(merchantProviderConfigurationInputType.graphObj) }
    })
});
