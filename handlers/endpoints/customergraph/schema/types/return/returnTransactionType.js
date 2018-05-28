
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;

const transactionType = require('../transaction/transactionType');
const TransactionController = global.SixCRM.routes.include('entities', 'Transaction');

const returnTransactionProductType = require('./returnTransactionProductType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'returnTransactionType',
	description: 'A return transaction.',
	fields: () => ({
		transaction:{
			type: new GraphQLNonNull(transactionType.graphObj),
			resolve:(return_entity) => {
				let transactionController = new TransactionController();
				return transactionController.get({id: return_entity.transaction});
			}
		},
		products: {
			type: new GraphQLNonNull(new GraphQLList(returnTransactionProductType.graphObj)),
			description: 'The products associated with the return.',
		}
	}),
	interfaces: []
});
