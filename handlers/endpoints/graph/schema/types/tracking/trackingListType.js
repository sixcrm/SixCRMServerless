'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let trackingType = require('./trackingType');
let paginationType = require('../pagination/paginationType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'TrackingConfigs',
    description: 'Tracking Configurations',
    fields: () => ({
        trackings: {
            type: new GraphQLList(trackingType.graphObj),
            description: 'The trackings',
        },
        pagination: {
            type: new GraphQLNonNull(paginationType.graphObj),
            description: 'Query pagination',
        }
    }),
    interfaces: []
});
