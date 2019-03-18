const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;

let scheduleType = require('./scheduleType');
let cycleType = require('./cycleType');
let merchantProviderGroupType = require('../merchantprovidergroup/merchantProviderGroupType');
let ProductScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule');
const SMSProviderController = global.SixCRM.routes.include('controllers', 'entities/SMSProvider');
const smsProviderController = new SMSProviderController();

let emailTemplateType = require('../emailtemplate/emailTemplateType');
const smsProviderType = require('../smsprovider/SMSProviderType');
const EmailTemplateController = global.SixCRM.routes.include('controllers', 'entities/EmailTemplate.js');
const emailTemplateController = new EmailTemplateController();

const MerchantProviderGroupController = global.SixCRM.routes.include('controllers', 'entities/MerchantProviderGroup.js');
const merchantProviderGroupController = new MerchantProviderGroupController();

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
			description: '`schedule` will be removed. Use `ProductSchedule.cycles` instead.',
			deprecationReason: 'The `schedule` field is deprecated and will be removed soon.'
		},
		cycles: {
			type: new GraphQLList(cycleType.graphObj),
			description: 'The cycles associated with the product schedule',
		},
		merchantprovidergroup: {
			type: merchantProviderGroupType.graphObj,
			description: 'The merchant provider group associated with the product schedule.',
			resolve: (productschedule) => {
				if (!productschedule.merchant_provider_group_id) {
					return null;
				}

				return merchantProviderGroupController.get({id: productschedule.merchant_provider_group_id});
			}
		},
		emailtemplates: {
			type: new GraphQLList(emailTemplateType.graphObj),
			description: 'Email templates associated with this product schedule.',
			resolve: (productschedule) => emailTemplateController.listByProductSchedule(productschedule)
		},
		trial_required: {
			type: GraphQLBoolean,
			description: '`trial_required` will be removed. Use `ProductSchedule.trial_required` instead.',
			deprecationReason: 'The `trial_required` field is deprecated and will be removed soon.'
		},
		requires_confirmation: {
			type: GraphQLBoolean,
			description: 'Confirmation required after the initial purchase before the next cycle is billed'
		},
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
