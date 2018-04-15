
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLObjectType({
    name: 'EventsByAffiliateGroupType',
    description: 'Events by Affiliate Group',
    fields: () => ({
        affiliate: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The affiliate identifier',
        },
        count: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The affiliate event count',
        },
        percentage: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The affiliate event percentage',
        }
    }),
    interfaces: []
});
