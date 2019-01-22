
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
let userType = require('../user/userType');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
let sessionController = new SessionController();

module.exports.graphObj = new GraphQLObjectType({
	name: 'SessionCancel',
	description: 'A record denoting a customer, a group of products and corresponding transactions.',
	fields: () => ({
		cancelled: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'A boolean denoting the cancelled state of the session'
		},
		cancelled_by: {
			type: userType.graphObj,
			description: 'The user that cancelled the session.',
			resolve: (session) => {

				du.error('get user');

				du.error(session)

				return sessionController.getUser(session);
			}
		},
		cancelled_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the session was cancelled.',

		}
	})
});
