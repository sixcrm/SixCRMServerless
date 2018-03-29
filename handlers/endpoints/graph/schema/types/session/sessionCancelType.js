'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
let userType = require('../user/userType');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');

const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
let sessionController = new SessionController();

module.exports.graphObj = new GraphQLObjectType({
    name: 'SessionCancel',
    description: 'A record denoting a customer, a group of products and corresponding transactions.',
    fields: () => ({
			canceled: {
				type: new GraphQLNonNull(GraphQLBoolean),
				description: 'A boolean denoting the canceled state of the session'
			},
			canceled_by: {
				type: userType.graphObj,
				description: 'The user that canceled the session.',
				resolve: (session) => {

					du.error('get user');

					du.error(session)

					return sessionController.getUser(session);
				}
			},
			canceled_at: {
				type: new GraphQLNonNull(GraphQLString),
				description: 'ISO8601 datetime when the session was canceled.',

			}
		})
});
