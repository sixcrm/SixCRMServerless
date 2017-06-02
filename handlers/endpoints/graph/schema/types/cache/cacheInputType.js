'use strict';
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'CacheInputType',
    fields: () => ({
        usecache: { type: new GraphQLNonNull(GraphQLBoolean) },
        expiration: { type: GraphQLInt }
    })
});
