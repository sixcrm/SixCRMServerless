const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;

let billDetailItemType = require('./billDetailItemType.js');
let billAccountType = require('./billAccountType.js');

const AccountController = global.SixCRM.routes.include('controllers', 'entities/Account.js');
const accountController = new AccountController();

module.exports.graphObj = new GraphQLObjectType({
	name: 'bill',
	description: 'A bill.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the bill.',
		},
		detail: {
			type: new GraphQLList(billDetailItemType.graphObj),
			description: 'Line item charges associated with the bill',
		},
		account: {
			type: billAccountType.graphObj,
			description: 'Owner account of the bill.',
			resolve: function (bill) {
				return accountController.get({
					id: bill.account
				})
			}
		},
		paid: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'The paid status of the bill.'
		},
		paid_result: {
			type: GraphQLString,
			description: 'The payment token.'
		},
		outstanding: {
			type: GraphQLBoolean,
			description: 'A boolean denoting the bill\'s "outstanding" status.'
		},
		period_end_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime that specifies the bill period start moment.',
		},
		period_start_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime that specifies the bill period end moment.',
		},
		available_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime that specifies when the bill is available for payment.',
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
