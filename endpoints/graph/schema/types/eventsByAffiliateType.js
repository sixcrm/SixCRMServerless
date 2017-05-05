'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInt = require('graphql').GraphQLInt;

const eventsByAffiliateGroupType = require('./eventsByAffiliateGroupType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'EventsByAffiliateType',
    description: 'Events by Affiliate',
    fields: () => ({
        count: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Placeholder',
        },
        affiliates:{
            type: new GraphQLList(eventsByAffiliateGroupType.graphObj),
            description: 'The affiliates'
        }
    }),
    interfaces: []
});
