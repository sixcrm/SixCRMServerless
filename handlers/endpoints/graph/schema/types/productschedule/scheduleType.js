const GraphQLString = require('graphql').GraphQLString;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let productType = require('../product/productType');
const ProductScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');

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
			resolve: (schedule) => {
				var productScheduleController = new ProductScheduleController();
				return productScheduleController.getProduct(schedule)
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
