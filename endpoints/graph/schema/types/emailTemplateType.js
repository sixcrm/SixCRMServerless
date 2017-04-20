const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const emailTemplateController = require('../../../../controllers/EmailTemplate.js');
let SMTPProviderType = require('./SMTPProviderType');
let emailTemplateTypeEnum = require('./emailTemplateTypeEnum');

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
            type: new GraphQLNonNull(GraphQLString),
            description: 'The email template body.',
        },
        type: {
            type: new GraphQLNonNull(emailTemplateTypeEnum.graphObj),
            description: 'The email template type (see enumeration).',
        },
        smtp_provider: {
            type: SMTPProviderType.graphObj,
            description: 'The SMTP Provider for the email template.',
            resolve: emailtemplate => emailTemplateController.getSMTPProvider(emailtemplate)
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
