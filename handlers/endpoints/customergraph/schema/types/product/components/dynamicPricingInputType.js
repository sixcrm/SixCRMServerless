
const {
	GraphQLInputObjectType,
	GraphQLFloat
} = require('graphql');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'DynamicPricingInput',
	fields: () => ({
		min: { type: GraphQLFloat },
		max: { type: GraphQLFloat }
	})
});
