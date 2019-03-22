const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;

let transactionalScheduleType = require('./transactionalScheduleType');
let merchantProviderGroupType = require('./../../merchantprovidergroup/merchantProviderGroupType');
const MerchantProviderGroupController = global.SixCRM.routes.include('controllers', 'entities/MerchantProviderGroup');
//let watermarkProductSchedule = require('./watermarkProductScheduleType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'TransactionalProductSchedule',
	description: 'A transactional product schedule.',
	fields: () => ({
		name: {
			type: GraphQLString,
			description: 'The name of product schedule.',
		},
		schedule: {
			type: new GraphQLList(transactionalScheduleType.graphObj),
			description: 'The schedules associated with the product schedule'
		},
		merchantprovidergroup: {
			type: merchantProviderGroupType.graphObj,
			description: 'The merchant provider group associated with the product schedule.',
			resolve: ({ merchantprovidergroup, merchant_provider_group_id }) => {
				const merchantProviderGroupController = new MerchantProviderGroupController();
				return merchantProviderGroupController.get(merchant_provider_group_id || merchantprovidergroup);
			}
		}
	}),
	interfaces: []
});
