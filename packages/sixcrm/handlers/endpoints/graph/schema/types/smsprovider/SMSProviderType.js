const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
	name: 'SMS',
	description: 'An SMS Provider',
	fields: () => ({
		id:					{ type: GraphQLString },
		account:			{ type: GraphQLString },
		name:				{ type: GraphQLString },
		type:				{ type: GraphQLString },
		api_account:		{ type: GraphQLString },
		api_token:			{ type: GraphQLString },
		from_number:		{ type: GraphQLString },
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
