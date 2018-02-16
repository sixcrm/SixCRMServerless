'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLObjectType({
    name: 'EventsByFacetGroupType',
    description: 'Events by Facet Group',
    fields: () => ({
        facet: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The facet identifier',
        },
        count: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The facet event count',
        },
        percentage: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The facet event percentage',
        }
    }),
    interfaces: []
});
