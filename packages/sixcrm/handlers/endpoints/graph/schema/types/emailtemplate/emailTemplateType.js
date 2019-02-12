require('module-alias/register');
const {
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLString,
	GraphQLInt,
	GraphQLList,
	GraphQLBoolean
} = require('graphql');
const { getProductSetupService, LegacyProduct } = require('@6crm/sixcrm-product-setup');

const EmailTemplateController = global.SixCRM.routes.include('controllers', 'entities/EmailTemplate.js');
const SMTPProviderType = require('../smtpprovider/SMTPProviderType');
const productType = require('../product/productType');
const productScheduleType = require('../productschedule/productScheduleType');
const campaignType = require('../campaign/campaignType');

const ProductScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');
const productScheduleController = new ProductScheduleController();

const CampaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');
const campaignController = new CampaignController();

const previewHelper = require('@lib/controllers/helpers/emailtemplates/EmailTemplateSender.js').default;


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
		products: {
			type: new GraphQLList(productType.graphObj),
			description: 'Products associated with email template',
			resolve: async ({ products: productIds }) => {
				const productSetupService = getProductSetupService();
				return (await productSetupService.getProductsByIds(productIds)).map(product =>
					LegacyProduct.hybridFromProduct(product)
				);
			}
		},
		product_schedules: {
			type: new GraphQLList(productScheduleType.graphObj),
			description: 'Product schedules associated with email template.',
			resolve: (emailtemplate) => {
				if (!emailtemplate.product_schedules) {
					return [];
				}
				return productScheduleController.batchGet({ids: emailtemplate.product_schedules});
			}
		},
		campaigns: {
			type: new GraphQLList(campaignType.graphObj),
			description: 'Campaigns associated with email template',
			resolve: (emailtemplate) => {
				if (!emailtemplate.campaigns) {
					return [];
				}
				return campaignController.batchGet({ids: emailtemplate.campaigns});
			}
		},
		preview: {
			type: GraphQLString,
			description: 'Preview of the template with example data',
			resolve: (emailtemplate) => {
				if (!emailtemplate.body) {
					return '';
				}
				return new previewHelper().compileBodyWithExampleData({template: emailtemplate});
			}
		},
		created_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was created.',
		},
		cycle: {
			type: GraphQLInt
		},
		enabled: {
			type: GraphQLBoolean
		},
		built_in: {
			type: GraphQLBoolean
		},
		updated_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was updated.',
		}
	}),
	interfaces: []
});
