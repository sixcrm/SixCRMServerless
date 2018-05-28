
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

let attributesInputType = require('./components/attributesInputType');
let dynamicPricingInputType = require('./components/dynamicPricingInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'ProductInput',
	fields: () => ({
		id:						{ type: GraphQLString },
		name:					{ type: new GraphQLNonNull(GraphQLString) },
		description:	{ type: GraphQLString },
		sku:					{ type: GraphQLString },
		ship:					{ type: GraphQLBoolean },
		shipping_delay: 		{ type: GraphQLInt },
		fulfillment_provider: 	{ type: GraphQLString },
		default_price:       	{ type: GraphQLFloat },
		dynamic_pricing:       	{ type: dynamicPricingInputType.graphObj },
		attributes: {type: attributesInputType.graphObj},
		updated_at: { type: GraphQLString }
	})
});
