
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let transactionalProductScheduleType = require('./transactionalProductScheduleType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'WatermarkProductSchedules',
	description: 'A quantity of a specific product schedule sold.',
	fields: () => ({
		quantity:{
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The watermark product schedules quantity.'
		},
		product_schedule:{
			type: new GraphQLNonNull(transactionalProductScheduleType.graphObj),
			description: 'The watermark product schedule.'
		}
	}),
	interfaces: []
});
