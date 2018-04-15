
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let paginationType = require('../pagination/paginationType');
let productScheduleType = require('./productScheduleType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'ProductSchedules',
	description: 'Product Schedules',
	fields: () => ({
		productschedules: {
			type: new GraphQLList(productScheduleType.graphObj),
			description: 'The product schedules',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
