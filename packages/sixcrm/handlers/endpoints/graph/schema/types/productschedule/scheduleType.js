const GraphQLString = require('graphql').GraphQLString;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const { getProductSetupService, LegacyProduct } = require('@6crm/sixcrm-product-setup');

let productType = require('../product/productType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'schedule',
	description: 'A scheduled product.',
	fields: () => ({
		price: {
			type: new GraphQLNonNull(GraphQLFloat),
			description: 'The price of schedule.',
		},
		start: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The start of schedule.',
		},
		end: {
			type: GraphQLInt,
			description: 'The end of schedule.',
		},
		period: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The period of schedule.',
		},
		product: {
			type: productType.graphObj,
			description: 'The product associated with the schedule',
			resolve: async ({ product, product_id }) => {
				const productId = product || product_id;

				try {
					const product = await getProductSetupService().getProduct(productId);
					return LegacyProduct.hybridFromProduct(product);
				} catch (e) {
					du.error('Cannot retrieve product on account', e);
					return null;
				}
			}
		},
		samedayofmonth:{
			type: GraphQLBoolean,
			description:  "Same day of the month billing"
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
