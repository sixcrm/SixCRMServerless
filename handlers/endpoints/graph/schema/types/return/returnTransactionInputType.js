
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

const returnTransactionProductInputType = require('./returnTransactionProductInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'returnTransactionInputType',
	fields: () => ({
		transaction: {
			type: new GraphQLNonNull(GraphQLString)
		},
		products: {
			type: new GraphQLNonNull(new GraphQLList(returnTransactionProductInputType.graphObj))
		}
	})
});
