
const GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let transactionType = require('./transactionType').graphObj;

module.exports.graphObj = new GraphQLInterfaceType({
	name: 'transaction',
	description: 'A tranasaction',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the transaction.',
		}
	}),
	resolveType() {
		return transactionType;
	}
});
