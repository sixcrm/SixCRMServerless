'use strict';
const GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let NMIType = require('../gateways/NMIType');
let InnovioType = require('../gateways/InnovioType');

//Technical Debt:  Additional may be a great place to introduce fragments (yes)
module.exports.graphObj = new GraphQLInterfaceType({
    name: 'merchantprovidergateway',
    description: 'A merchant provider gateway.',
    fields: () => ({
    	name: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The name of the merchant provider gateway name.',
      },
      type: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The name of the provider gateway'
      },
      username: {
        type: GraphQLString,
        description: 'The name of the merchant provider gateway username.',
      },
      password: {
        type: GraphQLString,
        description: 'The name of the merchant provider gateway password.',
      }
    }),
    resolveType(gateway) {
      return NMIType;
      /*
      if (gateway.type === 'NMI') {
        return NMIType;
      }
      if (gateway.type === 'Innovio') {
        return InnovioType;
      }
      */
    },
    interfaces: []
});
