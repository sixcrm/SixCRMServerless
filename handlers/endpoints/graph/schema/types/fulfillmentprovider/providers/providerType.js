'use strict';
let _ = require('underscore');

const GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLInterfaceType({
    name: 'FulfillmentProviderConfigurationInterface',
    description: 'A fulfillment provider configuration interface.',
    fields: () => ({
    	name: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The name of the fulfillment provider.',
      }
    }),
    resolveType(provider){
      //Technical Debt:  Necessary because of circuitous includes...
      let HashtagType = require('./HashtagType');
      let ThreePLType = require('./ThreePLType');

      let providertypes = {
        'Hashtag':HashtagType,
        'ThreePL':ThreePLType
      };

      if(_.has(providertypes, provider.name)){
        return providertypes[provider.name].graphObj;
      }else{
        return null;
      }

    },
    interfaces: []
});
