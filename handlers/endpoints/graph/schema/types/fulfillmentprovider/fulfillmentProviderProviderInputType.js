'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let fulfillmentProviderProviderEnum = require('./fulfillmentProviderProviderEnum');

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'fulfillmentproviderproviderinputtype',
    description: 'A type of fulfillment provider.',
    fields: () => ({
        name: { type: new GraphQLNonNull(GraphQLString) },
    }),
    interfaces: []
});
