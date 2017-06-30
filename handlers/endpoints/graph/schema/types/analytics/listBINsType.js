'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const BINType = require('./BINType');
const analyticsPaginationType = require('./paginationType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'listBINsType',
    description: 'BIN List',
    fields: () => ({
        bins: {
            type: new GraphQLList(BINType.graphObj),
            description: 'A BIN',
        },
        pagination: {
            type: new GraphQLNonNull(analyticsPaginationType.graphObj),
            description: 'The pagination results',
        }
    }),
    interfaces: []
});
