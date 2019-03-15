const {
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLString,
	GraphQLInt,
	GraphQLFloat,
	GraphQLList
} = require('graphql');
const cycleProductType = require('./cycleProductType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'ProductScheduleCycleType',
	fields: () => ({
		cycle_products:	{ type: new GraphQLList(cycleProductType.graphObj) },
		price:				{ type: new GraphQLNonNull(GraphQLFloat) },
		shipping_price:				{ type: new GraphQLNonNull(GraphQLFloat) },
		length:				{ type: new GraphQLNonNull(GraphQLString) },
		position: { type: new GraphQLNonNull(GraphQLInt) },
		next_position: { type: GraphQLInt }
	})
});
