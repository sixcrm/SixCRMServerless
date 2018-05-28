const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let permissionsType = require('./permissionsType');

const RoleController = global.SixCRM.routes.include('controllers', 'entities/Role.js');
const roleController = new RoleController();

module.exports.graphObj = new GraphQLObjectType({
	name: 'Role',
	description: 'A role.',
	fields: () => ({
		id: {
			type: GraphQLString,
			description: 'The id of the role.',
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the role.',
		},
		active: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'The active status of the role.',
		},
		permissions: {
			type: new GraphQLNonNull(permissionsType.graphObj),
			description: 'The permissions associated with the role.',
			resolve: role => roleController.getPermissions(role)
		},
		created_at: {
			type: GraphQLString,
			description: 'ISO8601 datetime when the entity was created.',
		},
		updated_at: {
			type: GraphQLString,
			description: 'ISO8601 datetime when the entity was updated.',
		}
	}),
	interfaces: []
});
