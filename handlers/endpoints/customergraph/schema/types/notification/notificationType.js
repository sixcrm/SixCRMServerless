const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLJSON = require('graphql-type-json');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Notification',
	description: 'A notification.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the notification.',
		},
		user: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the user who is an owner of the notification.',
		},
		account: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the account notification is associated with.',
		},
		type: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The type of the notification.',
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the notification.',
		},
		category: {
			type: GraphQLString,
			description: 'The category of the notification.',
		},
		context: {
			type: GraphQLJSON,
			description: 'The context associated with the notification.',
		},
		expires_at: {
			type: GraphQLString,
			description: 'ISO8601 datetime at which notification expires.',
		},
		read_at: {
			type: GraphQLString,
			description: 'ISO8601 datetime at which the user has read the notification.',
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
