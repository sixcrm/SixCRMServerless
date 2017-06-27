'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLList = require('graphql').GraphQLList;

let merchantProviderProcessorType = require('./elements/processorType');
let merchantProviderProcessingType = require('./elements/processingType');
let merchantProviderGatewayType = require('./elements/gatewayType');
let merchantProviderCustomerServiceType = require('./elements/customerServiceType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'merchantprovider',
    description: 'A merchant provider.',
    fields: () => ({
    	id: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The id of the merchant provider instance.',
    },
        name: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The name of the merchant provider instance.',
        },
  		enabled:{
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'The enabled status of the merchant provider instance.'
  },
  		allow_prepaid:{
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether or not to allow prepaid transactions on the merchant provider instance.'
  },
  		accepted_payment_methods:{
      type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      description: 'Allowed payment methods.'
  },
        processor:{
  			type: new GraphQLNonNull(merchantProviderProcessorType.graphObj),
            description: 'The merchant provider instance\'s processor.'
  		},
  		processing:{
      type: new GraphQLNonNull(merchantProviderProcessingType.graphObj),
      description: 'The merchant provider\'s processing configuration object.'
  },
        gateway: {
            type: new GraphQLNonNull(merchantProviderGatewayType.graphObj),
            description: 'The merchant provider\'s processing configuration object.'
  		},
  		customer_service:{
      type: merchantProviderCustomerServiceType.graphObj,
      description:  'The merchant provider\'s customer service properties, where available.'
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
