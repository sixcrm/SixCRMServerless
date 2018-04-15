
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInt = require('graphql').GraphQLInt;

const eventsByFacetGroupType = require('./eventsByFacetGroupType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'EventsByFacetType',
    description: 'Events by Facet',
    fields: () => ({
        count: {
            type: new GraphQLNonNull(GraphQLInt),
            description: 'Placeholder',
        },
        facet_type: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The facet type',
        },
        facets:{
            type: new GraphQLList(eventsByFacetGroupType.graphObj),
            description: 'The facets'
        }
    }),
    interfaces: []
});
