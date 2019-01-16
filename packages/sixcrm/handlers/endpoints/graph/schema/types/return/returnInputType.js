
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

const returnTransactionInputType = require('./returnTransactionInputType');
const returnHistoryInputType = require('./returnHistoryInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'returnInputType',
	fields: () => ({
		id:	{ type: GraphQLString },
		transactions: {
			type: new GraphQLNonNull(new GraphQLList(returnTransactionInputType.graphObj))
		},
		history: {
			type: new GraphQLList(returnHistoryInputType.graphObj)
		},
		updated_at: { type: GraphQLString }
	})
});
