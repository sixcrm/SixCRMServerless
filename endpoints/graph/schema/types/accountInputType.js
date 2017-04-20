const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'AccountInput',
    fields: () => ({
        id:					{ type: new GraphQLNonNull(GraphQLString) },
        name:				{ type: new GraphQLNonNull(GraphQLString) },
        active:				{ type: new GraphQLNonNull(GraphQLString) }
    })
});
