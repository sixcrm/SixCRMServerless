
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;

let paginationType = require('../pagination/paginationType');
let transactionType = require('./transactionType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Transactions',
	description: 'Transactions',
	fields: () => ({
		transactions: {
			type: new GraphQLList(transactionType.graphObj),
			description: 'The transactions',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
