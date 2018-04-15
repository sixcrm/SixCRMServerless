
const {
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLString
} = require('graphql');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Tag',
	description: 'A tag object.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the tag.',
		},
		entity: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the entity.',
		},
		key: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The key of the tag.',
		},
		value: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The value of the tag.',
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
