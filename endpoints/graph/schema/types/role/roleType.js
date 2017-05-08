'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let permissionsType = require('../permissionsType');

const roleController = require('../../../../../controllers/Role.js');

module.exports.graphObj = new GraphQLObjectType({
    name: 'Role',
    description: 'A role.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the role.',
        },
        name: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The name of the role.',
        },
        active: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The active status of the role.',
        },
        permissions:{
            type: new GraphQLNonNull(permissionsType.graphObj),
            description: 'The permsissions associated with the role.',
            resolve: role => roleController.getPermissions(role)
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
