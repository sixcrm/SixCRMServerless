'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;

let userNotificationSettingType = require('./userNotificationSettingType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'UserSetting',
    description: 'A user setting.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the user.',
        },
        work_phone: {
            type: GraphQLString,
            description: 'Work phone number.',
        },
        cell_phone: {
            type: GraphQLString,
            description: 'Cell phone number.',
        },
        timezone: {
            type: GraphQLString,
            description: 'Timezone.',
        },
        notifications: {
            type: new GraphQLList(userNotificationSettingType.graphObj),
            description:'The settings for notifications.'
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
