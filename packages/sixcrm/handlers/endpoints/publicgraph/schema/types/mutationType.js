require('module-alias/register');

const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

const acceptedInviteType = require('./invite/acceptedInvite');

const InviteHelperController = global.SixCRM.routes.include('helpers', 'entities/invite/Invite.js');
const TrialConfirmationHelperController = require('@lib/controllers/helpers/entities/trialconfirmation/TrialConfirmation.js').default;

module.exports.graphObj = new GraphQLObjectType({
	name: 'Mutation',
	fields: () => Object.assign({
		acceptinvite: {
			type: acceptedInviteType.graphObj,
			description: 'Accept a invite',
			args: {
				hash: {
					type: new GraphQLNonNull(GraphQLString)
				},
				signature: {
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: function(root, args) {
				const inviteHelperController = new InviteHelperController();
				return inviteHelperController.accept(args);
			}
		},
		confirmtrial: {
			type: new GraphQLObjectType({
				name: 'TrialConfirmationTrigger',
				fields: () => ({
					result: {
						type: GraphQLString,
						description: 'OK',
					}
				}),
				interfaces: []
			}),
			description: 'Confirm a trial',
			args: {
				code: {
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve: function(root, args) {
				const helper = new TrialConfirmationHelperController();
				return helper.confirmTrial(args.code);
			}
		}
	})
});
