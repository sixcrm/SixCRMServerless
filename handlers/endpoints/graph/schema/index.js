'use strict';
const GraphQLSchema = require('graphql').GraphQLSchema;
let mutationType = require('./types/mutationType');
let queryType = require('./types/queryType');

//Technical Debt:  Hack!
let NMIType = require('./types/merchantprovider/gateways/NMIType');
let InnovioType = require('./types/merchantprovider/gateways/InnovioType');
let GatewayType = require('./types/merchantprovider/gateways/gatewayType');



module.exports = new GraphQLSchema({
    query: queryType.graphObj,
    mutation: mutationType.graphObj,
    types: [NMIType.graphObj, InnovioType.graphObj, GatewayType.graphObj]
});
