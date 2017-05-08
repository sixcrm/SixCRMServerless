'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let productType = require('../product/productType');

const productScheduleController = require('../../../../../controllers/ProductSchedule.js');

module.exports.graphObj = new GraphQLObjectType({
    name: 'schedule',
    description: 'A scheduled product.',
    fields: () => ({
        price: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The price of schedule.',
        },
        start: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The start of schedule.',
        },
        end: {
            type: GraphQLString,
            description: 'The end of schedule.',
        },
        period: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The period of schedule.',
        },
        product: {
	        type: productType.graphObj,
            description:'The product associated with the schedule',
	        resolve: schedule => productScheduleController.getProduct(schedule)
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
