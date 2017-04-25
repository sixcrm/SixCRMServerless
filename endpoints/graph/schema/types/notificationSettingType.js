'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
    name: 'NotificationSetting',
    description: 'A notification setting.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the notification.',
        },
        user: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the user who is an owner of the notification.',
        },
        settings: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The serialized notification settings for the user .',
        },
        created_at: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The date that the settings were created.',
        },
        updated_at: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The date that the settings were updated.',
        }
    }),
    interfaces: []
});
