const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
    name: 'deleteOutput',
    fields: () => ({
        id:	{ type: new GraphQLNonNull(GraphQLString) }
    })
});
