'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

const productScheduleProductConfigurationInputType = require('./productScheduleProductConfigurationInputType');

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'ProductScheduleProductConfigurationInputType',
    fields: () => ({
        product_id:		{ type: new GraphQLNonNull(GraphQLString) },
        price:				{ type: new GraphQLNonNull(GraphQLFloat) },
        start:				{ type: new GraphQLNonNull(GraphQLInt) },
        period:				{ type: new GraphQLNonNull(GraphQLInt) },
        schedule:			{ type: new GraphQLList(productScheduleProductConfigurationInputType.graphObj) },
        end:				  { type: GraphQLInt }
    })
});
