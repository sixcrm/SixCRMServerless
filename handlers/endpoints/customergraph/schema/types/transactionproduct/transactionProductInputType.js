
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'TransactionProductInputType',
	fields: () => ({
		amount:				{ type: new GraphQLNonNull(GraphQLString) },
		product:			{ type: new GraphQLNonNull(GraphQLString) }
	})
});
