const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

const termsAndConditionsType = require('./termsandconditions/termsAndConditionsType');
const acknowledgedInviteType = require('./invite/acknowledgedInviteType');

const InviteHelperController = global.SixCRM.routes.include('helpers', 'entities/invite/Invite.js');
const TermsAndConditionsHelperController = global.SixCRM.routes.include('helpers', 'terms-and-conditions/TermsAndConditions.js');

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
		},
		latesttermsandconditions: {
			type: termsAndConditionsType.graphObj,
			description: 'Retrieves latest terms and conditions.',
			args: {
				role: {
					type: GraphQLString
				},
				account: {
					type: GraphQLString
				}
			},
			resolve: function(root, args) {
				const termsAndConditionsHelperController = new TermsAndConditionsHelperController();
				return termsAndConditionsHelperController.getLatestTermsAndConditions(args.role, args.account);
			}
		},
	})
});
