
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let returnHistoryType = require('./returnHistoryType');
let returnTransactionType = require('./returnTransactionType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Return',
	description: 'A record denoting a return.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the transaction.',
		},
		alias:{
			type: new GraphQLNonNull(GraphQLString),
			description: 'The return alias'
		},
		history: {
			type: new GraphQLNonNull(new GraphQLList(returnHistoryType.graphObj)),
			description: 'History of the return',
		},
		transactions: {
			type: new GraphQLNonNull(new GraphQLList(returnTransactionType.graphObj)),
			description: 'The transactions associated with the return'
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
