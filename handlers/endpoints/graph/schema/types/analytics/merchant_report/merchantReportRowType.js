
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

const MerchantProviderController = global.SixCRM.routes.include('controllers', 'entities/MerchantProvider.js');
const merchantProviderController = new MerchantProviderController();
const merchantProviderType = require('./../../merchantprovider/merchantProviderType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'MerchantReportRowType',
	description: 'Merchant Report Row',
	fields: () => ({
		merchant_provider: {
			type: merchantProviderType.graphObj,
			description: 'The merchant provider',
			resolve: (row) => {
				return merchantProviderController.get({id: row.merchant_provider});
			}
		},
		sale_count: {
			type: GraphQLString
		},
		sale_gross_revenue: {
			type: GraphQLString
		},
		refund_expenses: {
			type: GraphQLString
		},
		refund_count: {
			type: GraphQLString
		},
		net_revenue: {
			type: GraphQLString
		},
		mtd_sales_count: {
			type: GraphQLString
		},
		mtd_gross_count: {
			type: GraphQLString
		}
	}),
	interfaces: []
});
