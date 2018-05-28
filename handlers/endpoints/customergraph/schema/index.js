
const GraphQLSchema = require('graphql').GraphQLSchema;
let mutationType = require('./types/mutationType');
let queryType = require('./types/queryType');

//let ProductScheduleType = require('./types/productschedule/productScheduleType');
//let WatermarkProductScheduleType = require('./types/session/watermark/watermarkProductScheduleType');
//let TransactionalProductScheduleType = require('./types/session/watermark/transactionalProductScheduleType');

//Technical Debt:  Hack!
let NMIType = require('./types/merchantprovider/gateways/NMIType');
let TestMerchantProviderType = require('./types/merchantprovider/gateways/TestMerchantProviderType');
let InnovioType = require('./types/merchantprovider/gateways/InnovioType');
let StripeType = require('./types/merchantprovider/gateways/StripeType');
let AuthorizeNetType = require('./types/merchantprovider/gateways/AuthorizeNetType');
let GatewayType = require('./types/merchantprovider/gateways/gatewayType');

//Technical Debt: Hack!
let HashtagType = require('./types/fulfillmentprovider/providers/HashtagType');
let ThreePLType = require('./types/fulfillmentprovider/providers/ThreePLType');
let TestFulfillmentProviderType = require('./types/fulfillmentprovider/providers/TestFulfillmentProviderType');
let ShipStationType = require('./types/fulfillmentprovider/providers/ShipStationType');
let providerType = require('./types/fulfillmentprovider/providers/providerType');

module.exports = new GraphQLSchema({
	query: queryType.graphObj,
	mutation: mutationType.graphObj,
	types: [
		NMIType.graphObj,
		TestMerchantProviderType.graphObj,
		InnovioType.graphObj,
		StripeType.graphObj,
		AuthorizeNetType.graphObj,
		GatewayType.graphObj,
		HashtagType.graphObj,
		ThreePLType.graphObj,
		ShipStationType.graphObj,
		TestFulfillmentProviderType.graphObj,
		providerType.graphObj,
		//TransactionalProductScheduleType.graphObj
	]
});
