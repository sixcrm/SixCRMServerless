const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

const TransactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');
const transactionController = new TransactionController();
const MerchantProviderController = global.SixCRM.routes.include('controllers', 'entities/MerchantProvider.js');
const merchantProviderController = new MerchantProviderController();

let transactionInterface = require('./transactionInterface');
let transactionProductType = require('../transactionproduct/transactionProductType');
let rebillType = require('../rebill/rebillType');
let merchantProviderType = require('../merchantprovider/merchantProviderType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Transaction',
	description: 'A record denoting transactions.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the transaction.',
		},
		alias: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The alias of the transaction.',
		},
		amount: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The amount of the transaction.',
		},
		processor_response: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The date of the transaction.',
		},
		rebill: {
			type: rebillType.graphObj,
			description: 'The rebill of the transaction.',
			resolve: transaction => transactionController.getParentRebill(transaction)
		},
		products: {
			type: new GraphQLList(transactionProductType.graphObj),
			description: 'Products associated with the transaction',
			resolve: transaction => transactionController.getTransactionProducts(transaction)
		},
		merchant_provider: {
			type: merchantProviderType.graphObj,
			description: 'Merchant provider associated with the transaction.',
			resolve: transaction => {
				if (transaction.merchant_provider) {
					return merchantProviderController.get({
						id: transaction.merchant_provider
					});
				} else {
					return null;
				}
			}
		},
		type: {
			type: GraphQLString,
			description: 'The type of transaction.'
		},
		result: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The result of the transaction.'
		},
		chargeback: {
			type: GraphQLBoolean,
			description: 'Chargeback flag'
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
	interfaces: [transactionInterface.graphObj]
});
