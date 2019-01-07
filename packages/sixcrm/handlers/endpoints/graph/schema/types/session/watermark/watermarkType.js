
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
let watermarkProductsType = require('./watermarkProductsType');
let watermarkProductSchedulesType = require('./watermarkProductSchedulesType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Watermark',
	description: 'A session watermark.',
	fields: () => ({
		products:{
			type: new GraphQLList(watermarkProductsType.graphObj),
			description: 'Watermark products'
		},
		product_schedules:{
			type: new GraphQLList(watermarkProductSchedulesType.graphObj),
			description: 'Watermark product schedules'
		}
	}),
	interfaces: []
});
