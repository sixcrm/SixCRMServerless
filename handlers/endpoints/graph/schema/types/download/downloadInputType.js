'use strict';
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'DownloadInputType',
    fields: () => ({
        type: { type: new GraphQLNonNull(GraphQLString) }
    })
});
