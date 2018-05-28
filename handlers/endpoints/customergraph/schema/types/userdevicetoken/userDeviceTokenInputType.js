
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'UserDeviceTokenInput',
	fields: () => ({
		id:			{ type: new GraphQLNonNull(GraphQLString) },
		user:		{ type: new GraphQLNonNull(GraphQLString) },
		updated_at: { type: GraphQLString }
	})
});
