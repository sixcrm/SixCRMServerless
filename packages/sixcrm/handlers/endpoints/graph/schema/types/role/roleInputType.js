
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

const permissionsInputType = require('./permissionsInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'RoleInput',
	fields: () => ({
		id:					{ type: GraphQLString },
		name:				{ type: new GraphQLNonNull(GraphQLString) },
		active:				{ type: new GraphQLNonNull(GraphQLBoolean) },
		permissions: { type: new GraphQLNonNull(permissionsInputType.graphObj)},
		updated_at: { type: GraphQLString }
	})
});
