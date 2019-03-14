const {
	GraphQLInputObjectType,
	GraphQLNonNull,
	GraphQLString,
	GraphQLInt,
	GraphQLFloat,
	GraphQLList
} = require('graphql');
const cycleProductInputType = require('./cycleProductInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'ProductScheduleCycleInputType',
	fields: () => ({
		cycle_products:	{ type: new GraphQLList(cycleProductInputType.graphObj) },
		price:				{ type: new GraphQLNonNull(GraphQLFloat) },
		shipping_price:				{ type: new GraphQLNonNull(GraphQLFloat) },
		length:				{ type: new GraphQLNonNull(GraphQLString) },
		position: { type: new GraphQLNonNull(GraphQLInt) },
		next_position: { type: GraphQLInt }
	})
});
