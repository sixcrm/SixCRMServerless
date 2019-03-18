const {
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLInt,
	GraphQLFloat,
	GraphQLList
} = require('graphql');
const GraphQLJSON = require('graphql-type-json');

const cycleProductType = require('./cycleProductType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'ProductScheduleCycleType',
	fields: () => ({
		cycle_products:	{ type: new GraphQLList(cycleProductType.graphObj) },
		price:				{ type: new GraphQLNonNull(GraphQLFloat) },
		shipping_price:				{ type: new GraphQLNonNull(GraphQLFloat) },
		length:				{
			type: new GraphQLNonNull(GraphQLJSON),
			resolve: (cycle) => {
				try {
					return JSON.parse(cycle.length);
				} catch (error) {
					return cycle.length;
				}
			}
		},
		position: { type: new GraphQLNonNull(GraphQLInt) },
		next_position: { type: GraphQLInt }
	})
});
