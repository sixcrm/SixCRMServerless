const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
//const GraphQLInt = require('graphql').GraphQLInt;

const acknowledgedInviteType = require('./invite/acknowledgedInviteType');

const InviteHelperController = global.SixCRM.routes.include('helpers', 'entities/invite/Invite.js');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Query',
	fields: () => Object.assign({
		acknowledgeinvite: {
			type: acknowledgedInviteType.graphObj,
			description: 'Acknowledge a invite',
			args: {
				hash: {
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: function(root, args) {
				const inviteHelperController = new InviteHelperController();
				return inviteHelperController.acknowledge(args.hash);
			}
		}
	})
});
