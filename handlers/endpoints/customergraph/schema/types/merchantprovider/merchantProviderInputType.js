
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

const merchantProviderProcessorInputType = require('./elements/processorInputType');
const merchantProviderProcessingInputType = require('./elements/processingInputType');
const merchantProviderGatewayInputType = require('./elements/gatewayInputType');
const merchantProviderCustomerServiceInputType = require('./elements/customerServiceInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'MerchantProviderInput',
	fields: () => ({
		id: {
			type: GraphQLString,
			description: 'The id of the merchant provider instance.',
		},
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the merchant provider instance.',
		},
		enabled:{
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'The enabled status of the merchant provider instance.'
		},
		allow_prepaid:{
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'Whether or not to allow prepaid transactions on the merchant provider instance.'
		},
		accepted_payment_methods:{
			type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
			description: 'Allowed payment methods.'
		},
		processor:{
			type: new GraphQLNonNull(merchantProviderProcessorInputType.graphObj),
			description: 'The merchant provider instance\'s processor.'
		},
		processing:{
			type: new GraphQLNonNull(merchantProviderProcessingInputType.graphObj),
			description: 'The merchant provider\'s processing configuration object.'
		},
		gateway: {
			type: new GraphQLNonNull(merchantProviderGatewayInputType.graphObj),
			description: 'The merchant provider\'s processing configuration object.'
		},
		customer_service:{
			type: merchantProviderCustomerServiceInputType.graphObj,
			description:  'The merchant provider\'s customer service properties, where available.'
		},
		created_at: {
			type: GraphQLString,
			description: 'ISO8601 datetime when the entity was created.',
		},
		updated_at: {
			type: GraphQLString,
			description: 'ISO8601 datetime when the entity was updated.',
		}
	})
});
