
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionsByFacetGroupType',
    description: 'Transactions by Facet Group',
    fields: () => ({
        facet: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The facet identifier',
        },
        count: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The facet event count',
        },
        count_percentage: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The facet event percentage',
        },
        amount: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The transaction facet sum amount',
        },
        amount_percentage: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The transaction facet amount percentage',
        }
    }),
    interfaces: []
});
