
const GraphQLList = require('graphql').GraphQLList;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

let watermarkProductSchedulesInput = require('./watermarkProductSchedulesInputType');
let watermarkProductsInput = require('./watermarkProductsInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'WatermarkInput',
	fields: () => ({
		product_schedules: {
			type: new GraphQLList(watermarkProductSchedulesInput.graphObj),
			description: 'The session watermark product schedules',
		},
		products:{
			type: new GraphQLList(watermarkProductsInput.graphObj),
			description: 'The session watermark products'
		}
	})
});
