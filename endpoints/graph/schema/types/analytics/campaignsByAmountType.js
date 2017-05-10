'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;

const campaignsByAmountGroupType = require('./campaignsByAmountGroupType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'campaignsByAmountType',
    description: 'Campaigns By Amount',
    fields: () => ({
        campaigns: {
            type: new GraphQLList(campaignsByAmountGroupType.graphObj),
            description: 'The campaigns',
        }
    }),
    interfaces: []
});
