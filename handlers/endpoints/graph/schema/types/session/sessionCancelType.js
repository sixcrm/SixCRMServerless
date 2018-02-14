'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
let userType = require('../user/userType');

let sessionController =  global.SixCRM.routes.include('controllers', 'entities/Session.js');

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
					return sessionController.getUser(session);
				}
			},
			cancelled_at: {
				type: new GraphQLNonNull(GraphQLString),
				description: 'ISO8601 datetime when the session was cancelled.',

			}
		})
});
