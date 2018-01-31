'use strict';
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let imageDimensionsInputType = require('./imageDimensionsInputType');

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'ImageInput',
    fields: () => ({
      path:              { type: new GraphQLNonNull(GraphQLString) },
      dimensions: { type: imageDimensionsInputType.graphObj },
      name: { type: GraphQLString },
      description: { type: GraphQLString },
      format: { type: GraphQLString }
    })
});
