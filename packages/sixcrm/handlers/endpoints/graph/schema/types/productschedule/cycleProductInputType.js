const {
	GraphQLInputObjectType,
	GraphQLNonNull,
	GraphQLString,
	GraphQLInt,
	GraphQLBoolean
} = require('graphql');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'ProductScheduleCycleProductInputType',
	fields: () => ({
		id:					{ type: GraphQLString },
		product:		{ type: new GraphQLNonNull(GraphQLString) },
		is_shipping:    { type: GraphQLBoolean },
		position:    { type: GraphQLInt },
		quantity:    { type: GraphQLInt },
	})
});