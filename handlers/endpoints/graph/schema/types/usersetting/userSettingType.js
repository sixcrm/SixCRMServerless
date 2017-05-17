'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

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
        notification_sms: {
            type: GraphQLString,
            description: 'SMS number for receiving notifications.',
        },
        notification_email: {
            type: GraphQLString,
            description: 'Email address for receiving notifications.',
        },
        notification_skype: {
            type: GraphQLString,
            description: 'Skype address for receiving notifications.',
        },
        notification_slack_webhook: {
            type: GraphQLString,
            description: 'Slack webhook for receiving notifications.',
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
