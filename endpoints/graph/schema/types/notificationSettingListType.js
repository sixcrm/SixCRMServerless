'use strict';
let paginationType = require('./paginationType');
let notificationSettingType = require('./notificationSettingType');
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj =  new GraphQLObjectType({
    name: 'NotificationSettingList',
    description: 'Notification Settings.',
    fields: () => ({
        notificationsettings: {
            type: new GraphQLList(notificationSettingType.graphObj),
            description: 'Notification Settings.',
        },
        pagination: {
            type: new GraphQLNonNull(paginationType.graphObj),
            description: 'Query pagination',
        }
    }),
    interfaces: []
});
