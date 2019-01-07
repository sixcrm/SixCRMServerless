
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'TransactionRefundInputType',
	fields: () => ({
		amount:	{ type: new GraphQLNonNull(GraphQLFloat) }
	})
});
