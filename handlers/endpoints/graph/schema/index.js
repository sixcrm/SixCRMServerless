'use strict';
const GraphQLSchema = require('graphql').GraphQLSchema;
let mutationType = require('./types/mutationType');
let queryType = require('./types/queryType');

//Technical Debt:  Hack!
let NMIType = require('./types/merchantprovider/gateways/NMIType');
let TestMerchantProviderType = require('./types/merchantprovider/gateways/TestMerchantProviderType');
let InnovioType = require('./types/merchantprovider/gateways/InnovioType');
let GatewayType = require('./types/merchantprovider/gateways/gatewayType');

//Technical Debt: Hack!
let HashtagType = require('./types/fulfillmentprovider/providers/HashtagType');
let ThreePLType = require('./types/fulfillmentprovider/providers/ThreePLType');
let TestFulfillmentProviderType = require('./types/fulfillmentprovider/providers/TestFulfillmentProviderType');
let providerType = require('./types/fulfillmentprovider/providers/providerType');

module.exports = new GraphQLSchema({
  query: queryType.graphObj,
  mutation: mutationType.graphObj,
  types: [
    NMIType.graphObj,
    TestMerchantProviderType.graphObj,
    InnovioType.graphObj,
    GatewayType.graphObj,
    HashtagType.graphObj,
    ThreePLType.graphObj,
    TestFulfillmentProviderType.graphObj,
    providerType.graphObj
  ]
});
