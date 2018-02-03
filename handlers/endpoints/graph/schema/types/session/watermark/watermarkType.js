'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let watermarkProductsType = require('./watermarkProductsType');
let watermarkProductSchedulesType = require('./watermarkProductSchedulesType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'Watermark',
    description: 'A session watermark.',
    fields: () => ({
      products:{
        type: new GraphQLList(watermarkProductsType.graphObj),
        description: 'Watermark products'
      },
      product_schedules:{
        type: new GraphQLList(watermarkProductSchedulesType.graphObj),
        description: 'Watermark product schedules'
      }
    }),
    interfaces: []
});
