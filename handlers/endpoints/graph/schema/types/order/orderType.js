const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

const SessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');
const sessionController = new SessionController();

const publicCustomerType = require('../customer/publicCustomerType');
const transactionProductType = require('../transactionproduct/transactionProductType');
const sessionType = require('../session/sessionType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Order',
	description: 'An order.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the transaction.',
		},
		customer: {
			type: publicCustomerType.graphObj,
			description: 'The customer associated with the order.'
		},
		products: {
			type: new GraphQLList(transactionProductType.graphObj),
			description: 'The products associated with the order.'
		},
		amount: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The total amount of the order.'
		},
		date: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The date the order was placed.'
		},
		session: {
			type: sessionType.graphObj,
			description: 'The session associated with the order.',
			resolve: order => sessionController.get({id: order.session})
		}
	}),
	interfaces: []
});
