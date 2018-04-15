
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'BillDetailItemInputType',
	fields: () => ({
		description:{ type: new GraphQLNonNull(GraphQLString) },
		amount:     { type: new GraphQLNonNull(GraphQLFloat) },
		created_at: { type: new GraphQLNonNull(GraphQLString) }
	})
});
