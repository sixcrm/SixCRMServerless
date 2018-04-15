
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'SigningString',
	description: 'A user signing string.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the user signing string.',
		},
		user: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Id of the user.',
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Name of the signing string.',
		},
		signing_string: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Signing string.',
		},
		used_at: {
			type: GraphQLString,
			description:'When was the signing string used for the last time.'
		},
		created_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The date that the signing string was created.',
		},
		updated_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The date that the signing string was updated.',
		}
	}),
	interfaces: []
});
