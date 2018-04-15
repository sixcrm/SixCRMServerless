
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const EmailTemplateController = global.SixCRM.routes.include('controllers', 'entities/EmailTemplate.js');
let SMTPProviderType = require('../smtpprovider/SMTPProviderType');
//let emailTemplateTypeEnum = require('./emailTemplateTypeEnum');

module.exports.graphObj = new GraphQLObjectType({
	name: 'emailtemplate',
	description: 'A email template object',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The email template identifier.',
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The email template name.',
		},
		subject: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The email subject.',
		},
		body: {
			type: GraphQLString,
			description: 'The email template body.',
		},
		type: {
			//Technical Debt:  This is actually a good idea...
			//type: new GraphQLNonNull(emailTemplateTypeEnum.graphObj),
			type: new GraphQLNonNull(GraphQLString),
			description: 'The email template type (see enumeration).',
		},
		smtp_provider: {
			type: SMTPProviderType.graphObj,
			description: 'The SMTP Provider for the email template.',
			resolve: (emailtemplate) => {
				let emailTemplateController = new EmailTemplateController();

				return emailTemplateController.getSMTPProvider(emailtemplate);
			}
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
