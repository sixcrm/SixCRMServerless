
const {
	GraphQLObjectType,
	GraphQLFloat
} = require('graphql');

module.exports.graphObj = new GraphQLObjectType({
	name: 'DynamicPricing',
	description: 'Product dynamic pricing range',
	fields: () => ({
		min: {
			type: GraphQLFloat,
			description: 'The minimum dynamic product price'
		},
		max: {
			type: GraphQLFloat,
			description: 'The maximum dynamic product price'
		}
	})
});
