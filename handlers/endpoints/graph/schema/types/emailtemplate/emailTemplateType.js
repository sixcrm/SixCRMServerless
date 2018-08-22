
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;

const EmailTemplateController = global.SixCRM.routes.include('controllers', 'entities/EmailTemplate.js');
const SMTPProviderType = require('../smtpprovider/SMTPProviderType');
const productType = require('../product/productType');
const productScheduleType = require('../productschedule/productScheduleType');
//let emailTemplateTypeEnum = require('./emailTemplateTypeEnum');

const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
const productController = new ProductController();

const ProductScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');
const productScheduleController = new ProductScheduleController();

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
			description: 'The credit cards\'s customers.',
			resolve: (emailtemplate) => {
				if (!emailtemplate.products) {
					return [];
				}
				return productController.batchGet({ids: emailtemplate.products})
			}
		},
		product_schedules: {
			type: new GraphQLList(productScheduleType.graphObj),
			description: 'The credit cards\'s customers.',
			resolve: (emailtemplate) => {
				if (!emailtemplate.product_schedules) {
					return [];
				}
				return productScheduleController.batchGet({ids: emailtemplate.product_schedules});
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
