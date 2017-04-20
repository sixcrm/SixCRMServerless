'use strict';
let paginationType = require('./paginationType');
let notificationType = require('./notificationType');
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj =  new GraphQLObjectType({
    name: 'NotificationList',
    description: 'Notifications.',
    fields: () => ({
        notifications: {
            type: new GraphQLList(notificationType.graphObj),
            description: 'Notifications.',
        },
        pagination: {
            type: new GraphQLNonNull(paginationType.graphObj),
            description: 'Query pagination',
        }
    }),
    interfaces: []
});
