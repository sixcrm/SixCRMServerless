
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'TransactionChargebackInputType',
	fields: () => ({
		transaction: { type: new GraphQLNonNull(GraphQLString) },
		chargeback_status: { type: new GraphQLNonNull(GraphQLBoolean) }
	})
});
