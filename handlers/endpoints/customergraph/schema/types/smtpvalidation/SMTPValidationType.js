
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLJSON = require('graphql-type-json');

let SMTPProviderType = require('../smtpprovider/SMTPProviderType');
let SMTPSendPropertiesType = require('./SMTPSendPropertiesType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'SMTPValidation',
	description: 'A SMTP Validation.',
	fields: () => ({
		send_properties:{
			type: SMTPSendPropertiesType.graphObj,
			description: 'The properties related to the test email.'
		},
		smtp_response: {
			type: new GraphQLNonNull(GraphQLJSON),
			description: 'The response from the SMTP Server.'
		},
		smtpprovider: {
			type: SMTPProviderType.graphObj,
			description: 'The SMTP Provider for the email template.'
		}
	})
});
