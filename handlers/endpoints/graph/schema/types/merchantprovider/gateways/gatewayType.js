'use strict';
let _ = require('underscore');

const GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLInterfaceType({
    name: 'Gateway',
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
    resolveType(gateway){
      //Technical Debt:  Necessary because of circuitous includes...
      let NMIType = require('./NMIType');
      let InnovioType = require('./InnovioType');

      let gatewaytypes = {
        'NMI':NMIType,
        'Innovio':InnovioType
      };

      if(_.has(gatewaytypes, gateway.type)){
        return gatewaytypes[gateway.type].graphObj;
      }else{
        return null;
      }

    },
    interfaces: []
});
