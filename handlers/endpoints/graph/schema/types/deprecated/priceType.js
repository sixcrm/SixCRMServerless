
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
    name: 'Price',
    description: 'A price object',
    fields: () => ({
        straight: {
            type: GraphQLString,
            description: 'The straight sale price.',
        },
        trial: {
            type: GraphQLString,
            description: 'The trial price',
        }
    }),
    interfaces: []
});
