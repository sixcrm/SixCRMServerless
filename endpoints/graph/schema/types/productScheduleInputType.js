'use strict';
let productScheduleProductConfigurationInputType = require('./productScheduleProductConfigurationInputType');
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'ProductScheduleInputType',
    fields: () => ({
        id:					{ type: new GraphQLNonNull(GraphQLString) },
        name:				{ type: GraphQLString },
        schedule:			{ type: new GraphQLList(productScheduleProductConfigurationInputType.graphObj) }
    })
});
