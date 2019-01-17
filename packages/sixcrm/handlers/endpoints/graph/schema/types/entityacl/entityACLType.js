
const {
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList
} = require('graphql');

module.exports.graphObj = new GraphQLObjectType({
	name: 'EntityACL',
	description: 'A entity access control list object.',
	fields: () => ({
		entity: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the entity.',
		},
		type: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The type of the entity.',
		},
		allow: {
			type: new GraphQLList(GraphQLString),
			description: 'A permissions list.',
		},
		deny: {
			type: new GraphQLList(GraphQLString),
			description: 'A permissions list.',
		},
		created_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was created.',
		},
		updated_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was updated.',
		}
	})
});
