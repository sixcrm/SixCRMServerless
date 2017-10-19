'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'FulfillmentProviderValidationInput',
    fields: () => ({
        fulfillmentprovider:	{ type: new GraphQLNonNull(GraphQLString) }
    })
});
