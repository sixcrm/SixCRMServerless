
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let sessionType = require('../session/sessionType');
let customerType = require('../customer/customerType');

const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
const sessionController = new SessionController();
const CustomerController = global.SixCRM.routes.include('entities', 'Customer.js');
const customerController = new CustomerController();


module.exports.graphObj = new GraphQLObjectType({
	name: 'TrialConfirmation',
	description: 'A record denoting the status of a trial confirmation.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the session.',
		},
		session: {
			type: sessionType.graphObj,
			description: 'The session record that the trial confirmation references.',
			resolve: trial_confirmation => sessionController.get({id: trial_confirmation.session}),
		},
		customer: {
			type: customerType.graphObj,
			description: 'The customer record that the trial confirmation references.',
			resolve: trial_confirmation => customerController.get({id: trial_confirmation.customer}),
		},
		code: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'A short unique code to reference the confirmation.',
		},
		delivered_at: {
			type: GraphQLString,
			description: 'ISO8601 datetime when the trial was delivered.',
		},
		confirmed_at: {
			type: GraphQLString,
			description: 'ISO8601 datetime when the trial was confirmed.',
		},
		expires_at: {
			type: GraphQLString,
			description: 'ISO8601 datetime when the trial period expires.',
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
