'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const rebillType = require('../../../rebill/rebillType');
const analyticsPaginationType = require('./../../paginationType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'RebillsInQueueType',
    description: 'Rebills in queue',
    fields: () => ({
        count: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Total amount of rebills',
        },
        rebills: {
            type: new GraphQLList(rebillType.graphObj),
            description: 'The rebills',
        },
        pagination: {
            type: new GraphQLNonNull(analyticsPaginationType.graphObj),
            description: ''
        }
    }),
    interfaces: []
});
