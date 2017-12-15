'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let fulfillmentProviderProviderEnum = require('./fulfillmentProviderProviderEnum');

module.exports.graphObj = new GraphQLObjectType({
    name: 'fulfillmentproviderprovidertype',
    fields: () => ({
        name: { type: GraphQLString },
    }),
    interfaces: []
});
