
const {
	GraphQLInputObjectType,
	GraphQLString,
	GraphQLNonNull
} = require('graphql');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'TagInputType',
	fields: () => ({
		id: { type: GraphQLString },
		entity: { type: new GraphQLNonNull(GraphQLString) },
		key: { type: new GraphQLNonNull(GraphQLString) },
		value: { type: new GraphQLNonNull(GraphQLString) },
		updated_at: { type: GraphQLString }
	})
});
