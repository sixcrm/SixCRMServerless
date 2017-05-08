'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'ProductScheduleProductConfigurationInputType',
    fields: () => ({
        product_id:			{ type: new GraphQLNonNull(GraphQLString) },
        price:				{ type: new GraphQLNonNull(GraphQLString) },
        start:				{ type: new GraphQLNonNull(GraphQLString) },
        end:				{ type: GraphQLString },
        period:				{ type: new GraphQLNonNull(GraphQLString) }
    })
});
