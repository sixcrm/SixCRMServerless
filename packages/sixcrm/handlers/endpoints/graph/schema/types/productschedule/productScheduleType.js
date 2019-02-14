const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;

let scheduleType = require('./scheduleType');
let merchantProviderGroupType = require('../merchantprovidergroup/merchantProviderGroupType');
let ProductScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule');
const SMSProviderController = global.SixCRM.routes.include('controllers', 'entities/SMSProvider');
const smsProviderController = new SMSProviderController();

let emailTemplateType = require('../emailtemplate/emailTemplateType');
const smsProviderType = require('../smsprovider/SMSProviderType');
const EmailTemplateController = global.SixCRM.routes.include('controllers', 'entities/EmailTemplate.js');
const emailTemplateController = new EmailTemplateController();

module.exports.graphObj = new GraphQLObjectType({
	name: 'ProductSchedule',
	description: 'A product schedule.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of product schedule.',
		},
		name: {
			type: GraphQLString,
			description: 'The name of product schedule.',
		},
		schedule: {
			type: new GraphQLList(scheduleType.graphObj),
			description: 'The schedules associated with the product schedule',
			resolve: (product_schedule) => {
				const ProductScheduleHelperController = global.SixCRM.routes.include('helpers', 'entities/productschedule/ProductSchedule.js');
				let productScheduleHelperController = new ProductScheduleHelperController();

				return productScheduleHelperController.getSchedule({
					product_schedule: product_schedule
				});
			}
		},
		merchantprovidergroup: {
			type: merchantProviderGroupType.graphObj,
			description: 'The merchant provider group associated with the product schedule.',
			resolve: (productschedule) => {
				const productScheduleController = new ProductScheduleController();

				return productScheduleController.getMerchantProviderGroup(productschedule);
			}
		},
		emailtemplates: {
			type: new GraphQLList(emailTemplateType.graphObj),
			description: 'Email templates associated with this product schedule.',
			resolve: (productschedule) => emailTemplateController.listByProductSchedule(productschedule)
		},
		trial_required: { type: GraphQLBoolean },
		trial_sms_provider:  {
			type: smsProviderType.graphObj,
			resolve: (productschedule) => {
				if (!productschedule.trial_sms_provider) {
					return Promise.resolve(null);
				}
				return smsProviderController.get({id: productschedule.trial_sms_provider})
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
