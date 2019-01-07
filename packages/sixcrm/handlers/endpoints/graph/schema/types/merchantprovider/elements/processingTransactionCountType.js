
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLInt = require('graphql').GraphQLInt;

module.exports.graphObj = new GraphQLObjectType({
	name: 'merchantproviderprocessingconfigurationtransactioncount',
	description: 'A merchant provider processing configuration transaction count object.',
	fields: () => ({
		daily: {
			type: GraphQLInt,
			description: 'The maximum number of transactions that the merchant provider may process in a single day.'
		},
		weekly: {
			type: GraphQLInt,
			description: 'The maximum number of transactions that the merchant provider may process in a single week.'
		},
		monthly: {
			type: GraphQLInt,
			description: 'The maximum number of transactions that the merchant provider may process in a single month.'
		}
	}),
	interfaces: []
});
