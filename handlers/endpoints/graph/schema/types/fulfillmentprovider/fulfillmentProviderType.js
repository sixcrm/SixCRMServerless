'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let fulfillmentProviderProviderEnum = require('./fulfillmentProviderProviderEnum');

module.exports.graphObj = new GraphQLObjectType({
    name: 'fulfillmentprovider',
    description: 'A fulfillment provider.',
    fields: () => ({
  	id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the fulfillment provider instance.',
  },
        name: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The name of the fulfillment provider instance.',
        },
        provider: {
            type: new GraphQLNonNull(fulfillmentProviderProviderEnum.graphObj),
            description: 'The provider.',
        },
        username: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The provider username.',
        },
        password: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The provider password.',
        },
        company: {
            type: GraphQLString,
            description: 'Company.',
        },
        threepl_key: {
            type: GraphQLString,
            description: 'ThreePLKey.',
        },
        facility_id: {
            type: GraphQLString,
            description: 'FacilityID.',
        },
        threepl_id: {
            type: GraphQLString,
            description: 'ThreePLID.',
        },
        customer_id: {
            type: GraphQLString,
            description: 'CustomerID.',
        },
        return_address: {
            type: GraphQLString,
            description: 'Return Address.',
        },
        endpoint: {
	        type: GraphQLString,
            description:'The provider endpoint.'
        },
        created_at: {
	  type: new GraphQLNonNull(GraphQLString),
            description: 'ISO8601 datetime when the entity was created.',
        },
        updated_at: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'ISO8601 datetime when the entity was updated.',
        }
    }),
    interfaces: []
});
