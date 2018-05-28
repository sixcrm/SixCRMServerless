
const {
	GraphQLInputObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLNonNull
} = require('graphql');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'EntityACLInputType',
	fields: () => ({
		entity: { type: new GraphQLNonNull(GraphQLString) },
		type: { type: new GraphQLNonNull(GraphQLString) },
		allow:   { type: new GraphQLList(GraphQLString) },
		deny:   { type: new GraphQLList(GraphQLString) },
		updated_at: { type: GraphQLString }
	})
});
