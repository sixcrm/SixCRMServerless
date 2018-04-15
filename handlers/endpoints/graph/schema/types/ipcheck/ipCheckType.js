

const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLObjectType({
    name: 'ipCheck',
    fields: () => ({
        ipAddress: { type: new GraphQLNonNull(GraphQLString) }
    })
});
