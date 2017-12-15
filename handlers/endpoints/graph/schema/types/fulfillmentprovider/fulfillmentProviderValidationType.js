'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLJSON = require('graphql-type-json');

module.exports.graphObj = new GraphQLObjectType({
  name: 'FulfillmentProviderValidation',
  fields: () => ({
    response: {
      type: new GraphQLNonNull(GraphQLJSON),
      description: 'The response from the provider.'
    }
  })
});
