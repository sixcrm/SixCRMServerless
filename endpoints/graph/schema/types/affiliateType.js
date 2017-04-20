'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
    name: 'Affiliate',
    description: 'A affiliate.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the product.',
        },
        affiliate_id: {
            type: new GraphQLNonNull(GraphQLString),
            description: '.',
        },
        sub_id_1: {
            type: new GraphQLNonNull(GraphQLString),
            description: '.',
        },
        sub_id_2: {
            type: new GraphQLNonNull(GraphQLString),
            description: '.',
        },
        sub_id_3: {
            type: new GraphQLNonNull(GraphQLString),
            description: '.',
        },
        sub_id_4: {
            type: new GraphQLNonNull(GraphQLString),
            description: '.',
        },
        sub_id_5: {
            type: new GraphQLNonNull(GraphQLString),
            description: '.',
        },
        click_id: {
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
