'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let affiliateType = require('../affiliate/affiliateType');

const trackingController = global.routes.include('controllers', 'entities/Tracking.js');

module.exports.graphObj = new GraphQLObjectType({
    name: 'Tracking',
    description: 'A affiliate tracking configuration.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the tracking config.',
        },
        affiliate: {
            type: affiliateType.graphObj,
            description: '.',
            resolve: tracking => trackingController.getAffiliate(tracking),
        },
        type: {
            type: new GraphQLNonNull(GraphQLString),
            description: '.',
        },
        body: {
            type: new GraphQLNonNull(GraphQLString),
            description: '.',
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
