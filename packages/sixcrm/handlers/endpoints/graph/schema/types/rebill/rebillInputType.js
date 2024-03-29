
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLInt = require('graphql').GraphQLInt;


module.exports.graphObj = new GraphQLInputObjectType({
	name: 'RebillInputType',
	fields: () => ({
		id:					{ type: new GraphQLNonNull(GraphQLString) },
		bill_at:			{ type: new GraphQLNonNull(GraphQLString) },
		parentsession:		{ type: new GraphQLNonNull(GraphQLString) },
		amount:				{ type: new GraphQLNonNull(GraphQLString) },
		product_schedules:	{ type: new GraphQLList(GraphQLString) },
		cycle: 				{ type: GraphQLInt},
		updated_at: { type: GraphQLString }
	})
});
