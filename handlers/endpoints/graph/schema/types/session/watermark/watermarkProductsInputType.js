'use strict';
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLString = require('graphql').GraphQLString;

let transactionalProductInputType = require('./transactionalProductInputType');

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'WatermarkProductsInput',
    description: 'A quantity of a specific product sold.',
    fields: () => ({
      quantity:{
        type: new GraphQLNonNull(GraphQLInt),
        description: 'The watermark product quantity.'
      },
      price:{
        type: GraphQLFloat,
        description: 'The watermark product price'
      },
      product:{
        type: new GraphQLNonNull(transactionalProductInputType.graphObj),
        description: 'The watermark product.'
      }
    }),
    interfaces: []
});
