const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
	name: 'SMTP',
	description: 'A SMTP Provider',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The SMTP Provider identifier.',
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the SMTP Provider.',
		},
		hostname: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The hostname of the SMTP Provider.',
		},
		username: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'A username associated with the SMTP Provider.',
		},
		password: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The password associated with the username.',
		},
		port: {
			type: GraphQLInt,
			description: 'The SMTP port for the the SMTP Provider',
		},
		from_email: {
			type: GraphQLString,
			description: 'The email address that the emails from this SMTP Provider will be sent as.',
			example: "do_not_reply@sixcrm.com"
		},
		from_name: {
			type: GraphQLString,
			description: 'The name that the emails from this SMTP Provider will be sent as.',
			example: "Do Not Reply"
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
