'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

//Technical Debt:  Additional may be a great place to introduce fragments (yes)
module.exports.graphObj = new GraphQLObjectType({
    name: 'merchantprovidergateway',
    description: 'A merchant provider gateway.',
    fields: () => ({
    	name: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The name of the merchant provider gateway name.',
      },
      username: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The name of the merchant provider gateway username.',
      },
      password: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The name of the merchant provider gateway password.',
      },
      endpoint: {
        type: GraphQLString,
        description: 'The name of the merchant provider gateway endpoint.',
      },
      //Technical Debt: This may be totally redundant and deprecated.
      processor_id: {
        type: GraphQLString,
        description: 'The name of the merchant provider processor_id.',
      },
      additional:{
        type: GraphQLString,
        description: 'Additional properties associated with the merchant provider gateway.'
      }
    }),
    interfaces: []
});
