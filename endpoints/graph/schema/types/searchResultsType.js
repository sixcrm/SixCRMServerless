'use strict';
const GraphQLString = require('graphql').GraphQLString;
let searchHitsType = require('./searchHitsType');
let searchStatusType = require('./searchStatusType');
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
    name: 'SearchResults',
    description: 'Search Results.',
    fields: () => ({
        status: {
            type: new GraphQLNonNull(searchStatusType.graphObj),
            description: 'Search Result Status',
        },
        hits: {
            type: new GraphQLNonNull(searchHitsType.graphObj),
            description: 'Search Result Hits',
        },
        facets: {
            type: GraphQLString,
            description: 'Search Result Faceting'
        }
    }),
    interfaces: []
});
