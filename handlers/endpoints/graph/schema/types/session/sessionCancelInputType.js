
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLBoolean = require('graphql').GraphQLBoolean;


module.exports.graphObj = new GraphQLInputObjectType({
    name: 'CancelSessionInputType',
    fields: () => ({
			id: { type: new GraphQLNonNull(GraphQLString) },
      canceled: { type: new GraphQLNonNull(GraphQLBoolean) },
			canceled_by: { type: new GraphQLNonNull(GraphQLString) },
    })
});
