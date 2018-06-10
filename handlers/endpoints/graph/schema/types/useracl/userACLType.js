const _ = require('lodash');

const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

const UserACLController = global.SixCRM.routes.include('controllers', 'entities/UserACL.js');
const userACLController = new UserACLController();

let accountType = require('../account/accountType');
let roleType = require('../role/roleType');
let userType = require('../user/userType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'UserACL',
	description: 'A user access control list object.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the role.',
		},
		user: {
			type: userType.graphObj,
			description: 'The user related to user ACL object',
			resolve: (user_acl) => {
				return userACLController.getUser(user_acl);
			}
		},
		account: {
			type: accountType.graphObj,
			description: 'The account related to user ACL object',
			resolve: (user_acl) => {
				return userACLController.getAccount(user_acl);
			}
		},
		role: {
			type: new GraphQLNonNull(roleType.graphObj),
			description: 'The role related to user ACL object',
			resolve: (user_acl) => {
				if (_.isObject(user_acl.role)) {
					return user_acl.role;
				}

				return userACLController.getRole(user_acl);
			}
		},
		pending: {
			type: GraphQLString,
			description: 'User ACL pending category, if ACL is pending.',
		},
		termsandconditions_outdated: {
			type: GraphQLString,
			description: 'Is User ACL terms and conditions outdated.',
		},
		created_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was created.',
		},
		updated_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was updated.',
		}
	})
});
