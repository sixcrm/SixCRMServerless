'use strict';

const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
    name: 'LatestTermsAndConditions',
    description: 'Latest Terms and Conditions.',
    fields: () => ({
        content: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'Content of Terms and Conditions.',
        },
        version: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'Version of Terms and Conditions.',
        }
    }),
    interfaces: []
});
