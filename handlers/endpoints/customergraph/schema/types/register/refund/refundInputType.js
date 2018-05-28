
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'RefundInput',
	fields: () => ({
		transaction:  { type: new GraphQLNonNull(GraphQLString) },
		amount:	      { type: new GraphQLNonNull(GraphQLString) }
	})
});
