'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLList = require('graphql').GraphQLList;

let notificationSettingSubGroupType = require('./notificationSettingSubGroupType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'NotificationSettingGroup',
    description: 'A notification setting group.',
    fields: () => ({
        key: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The notifcation key.'
        },
        name: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The human readable notification name.'
        },
        description: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The notification description.'
        },
        default: {
            type: new GraphQLNonNull(GraphQLBoolean),
            description: 'The notification setting (boolean on/off).'
        },
        notifications:{
            type: new GraphQLList(notificationSettingSubGroupType.graphObj),
            description: 'The default notification group.'
        }
    }),
    interfaces: []
});
