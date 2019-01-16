
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'SMTPProviderInput',
	fields: () => ({
		id:					{ type: GraphQLString },
		name:				{ type: new GraphQLNonNull(GraphQLString) },
		hostname:			{ type: new GraphQLNonNull(GraphQLString) },
		username:			{ type: new GraphQLNonNull(GraphQLString) },
		password:			{ type: new GraphQLNonNull(GraphQLString) },
		from_email:{
			type: new GraphQLNonNull(GraphQLString),
			description: 'The email address that the emails from this SMTP Provider will be sent as.',
			example: "do_not_reply@sixcrm.com"
		},
		from_name:{
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name that the emails from this SMTP Provider will be sent as.',
			example: "Do Not Reply"
		},
		port:				{ type: GraphQLInt },
		updated_at: { type: GraphQLString }
	})
});
