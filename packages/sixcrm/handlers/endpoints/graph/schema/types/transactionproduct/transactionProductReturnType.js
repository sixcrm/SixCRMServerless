const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

const TransactionController = global.SixCRM.routes.include('entities', 'Transaction.js');

let returnType = require('../return/returnType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'transactionProductReturnType',
	description: 'A return associated with a transaction product.',
	fields: () => ({
		return: {
			type: new GraphQLNonNull(returnType.graphObj),
			description: 'Return associated with the transaction product',
			resolve: (a_return) => {
				const transactionController = new TransactionController();
				return transactionController.getReturn(a_return);
			}
		},
		quantity:{
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The number of the products referenced in the return'
		}
	}),
	interfaces: []
});
