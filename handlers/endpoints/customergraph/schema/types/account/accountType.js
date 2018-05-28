const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;

const AccountController = global.SixCRM.routes.include('controllers', 'entities/Account.js');
const accountController = new AccountController();

let userACLType = require('../useracl/userACLType');
let accountBillingType = require('./accountBillingType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Account',
	description: 'A account.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the account.',
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the account.',
		},
		billing: {
			type: accountBillingType.graphObj,
			description: "Account billing properties"
		},
		active: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'The active status of the account.',
		},
		acl: {
			type: new GraphQLList(userACLType.graphObj),
			description: 'The user\'s ACL objects.',
			resolve: (account) => accountController.getACL(account)
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
