const _ = require('lodash');

const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

const UserController = global.SixCRM.routes.include('controllers', 'entities/User.js');
const userController = new UserController();

const UserHelperController = global.SixCRM.routes.include('helpers', 'entities/user/User.js');
const userHelperController = new UserHelperController();

let userACLType = require('../useracl/userACLType');
let accessKeyType = require('../accesskey/accessKeyType');
let addressType = require('../address/addressType');
let userSettingType = require('../usersetting/userSettingType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'User',
	description: 'A user.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the user',
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the user',
		},
		first_name: {
			type: GraphQLString,
			description: 'The first name of the user',
		},
		last_name: {
			type: GraphQLString,
			description: 'The last name of the user',
		},
		auth0_id: {
			type: GraphQLString,
			description: 'The auth0_id of the user.',
		},
		active: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'The active status of the user',
		},
		alias: {
			type: GraphQLString,
			description: 'Alias of the user',
		},
		termsandconditions: {
			type: GraphQLString,
			description: 'The accepted Terms and Conditions version.',
		},
		termsandconditions_outdated: {
			type: GraphQLString,
			description: 'Are terms and conditions outdated, is there a newer version.',
		},
		acl: {
			type: new GraphQLList(userACLType.graphObj),
			description: 'The user\'s ACL objects.',
			resolve: (user) => userController.getACL(user)
		},
		accesskey: {
			type: accessKeyType.graphObj,
			description: 'The access_key of the user.',
			resolve: (user) => {
				if (_.has(user, 'access_key_id')) {
					var id = user.access_key_id

					return userController.getAccessKey(id);
				} else {
					return null;
				}
			}
		},
		address: {
			type: addressType.graphObj,
			description: 'The address of the user.',
			resolve: (user) => {
				return userHelperController.getAddress(user);
			}
		},
		usersetting: {
			type: userSettingType.graphObj,
			description: 'User setting.'
		},
		created_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was created.',
		},
		updated_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was updated.',
		}
	}),
	interfaces: []
});
