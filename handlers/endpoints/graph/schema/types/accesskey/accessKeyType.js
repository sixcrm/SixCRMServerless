
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'AccessKey',
	description: 'A accesskey.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the accesskey.',
		},
		name: {
			type:GraphQLString,
			description: 'The access key name.'
		},
		notes: {
			type: GraphQLString,
			description: 'The access key notes.'
		},
		access_key: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The access_key of the accesskey.',
		},
		secret_key: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The secret_key of the accesskey.',
		},
		created_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was created.',
		},
		updated_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was updated.',
		}
	}),
	interfaces: []
});
