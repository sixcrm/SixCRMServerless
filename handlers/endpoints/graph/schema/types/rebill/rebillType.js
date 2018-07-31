
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let transactionType = require('../transaction/transactionType');
let transactionProductType = require('../transactionproduct/transactionProductType');
let productScheduleType = require('../productschedule/productScheduleType');
let sessionType = require('../session/sessionType');
let rebillStateHistoryItem = require('./rebillStateHistoryItemType');
let rebillPaid = require('./rebillPaidType');
let shippingReceiptType = require('../shippingreceipt/shippingReceiptType');

const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
const rebillController = new RebillController();

module.exports.graphObj = new GraphQLObjectType({
	name: 'Rebill',
	description: 'A record denoting a rebill.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the rebill.',
		},
		alias: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The alias of the rebill.'
		},
		bill_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The date of the rebill.',
		},
		amount: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The amount of the rebill.',
		},
		resolved_amount: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The resolved amount of the rebill, taking into account voids, refunds and chargebacks.',
			resolve: rebill => rebillController.getResolvedAmount(rebill)
		},
		parentsession: {
			type: sessionType.graphObj,
			description: 'The session associated with the transaction.',
			resolve: rebill => rebillController.getParentSession(rebill),
		},
		product_schedules: {
			type: new GraphQLList(productScheduleType.graphObj),
			description:'The product schedules associated with the rebill',
			resolve: rebill => rebillController.listProductSchedules(rebill),
		},
		products: {
			type: new GraphQLList(transactionProductType.graphObj),
			description:'The products associated with the rebill'
		},
		transactions: {
			type: new GraphQLList(transactionType.graphObj),
			description: 'The transactions associated with the rebill',
			resolve: (rebill) => {
				return rebillController.listTransactions(rebill).then(response => response.transactions);
			}
		},
		shippingreceipts: {
			type: new GraphQLList(shippingReceiptType.graphObj),
			description: 'The shipping receipts associated with the rebill',
			resolve: (rebill) => {
				const rebillHelperController = new RebillHelperController();

				return rebillHelperController.getShippingReceipts({rebill: rebill});
			}
		},
		created_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was created.',
		},
		updated_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was updated.',
		},
		state: {
			type: GraphQLString,
			description: 'State rebill is currently in.',
		},
		previous_state: {
			type: GraphQLString,
			description: 'State rebill was previously in.',
		},
		state_changed_at: {
			type: GraphQLString,
			description: 'ISO8601 datetime when the state of the rebill was changed.',
		},
		history: {
			type: new GraphQLList(rebillStateHistoryItem.graphObj),
			description: 'State history of the rebill',
		},
		paid: {
			type: rebillPaid.graphObj,
			description: 'Payment status of the rebill'
		}
	}),
	interfaces: []
});
