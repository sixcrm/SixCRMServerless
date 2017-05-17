'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;

const campaignDeltaGroupType = require('./campaignDeltaGroupType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'campaignDeltaType',
    description: 'Campaign Delta',
    fields: () => ({
        campaigns: {
            type: new GraphQLList(campaignDeltaGroupType.graphObj),
            description: 'The campaigns',
        }
    }),
    interfaces: []
});
