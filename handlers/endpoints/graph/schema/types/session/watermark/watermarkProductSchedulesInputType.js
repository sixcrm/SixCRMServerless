
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let transactionalProductScheduleInputType = require('./transactionalProductScheduleInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'WatermarkProductSchedulesInput',
	description: 'A quantity of a specific product schedule sold.',
	fields: () => ({
		quantity:{
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The watermark product schedules quantity.'
		},
		product_schedule:{
			type: new GraphQLNonNull(transactionalProductScheduleInputType.graphObj),
			description: 'The watermark product schedule.'
		}
	}),
	interfaces: []
});
