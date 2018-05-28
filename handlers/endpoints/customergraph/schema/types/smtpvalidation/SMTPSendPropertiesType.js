
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;

module.exports.graphObj = new GraphQLObjectType({
	name: 'SMTPSendPropertiesType',
	description: 'A SMTP Send Properties Object.',
	fields: () => ({
		sender_email: {
			type: new GraphQLNonNull(GraphQLString)
		},
		sender_name: {
			type: new GraphQLNonNull(GraphQLString)
		},
		subject: {
			type: new GraphQLNonNull(GraphQLString)
		},
		body:  {
			type: new GraphQLNonNull(GraphQLString)
		},
		recepient_emails:{
			type: new GraphQLNonNull(new GraphQLList(GraphQLString))
		}
	})
});
