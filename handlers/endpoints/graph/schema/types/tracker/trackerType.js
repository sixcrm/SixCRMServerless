'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let affiliateType = require('../affiliate/affiliateType');

const trackerController = global.routes.include('controllers', 'entities/Tracker.js');

module.exports.graphObj = new GraphQLObjectType({
    name: 'Tracker',
    description: 'A tracker.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the tracker.',
        },
        affiliate: {
            type: affiliateType.graphObj,
            description: '.',
            resolve: tracker => trackerController.getAffiliate(tracker),
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
