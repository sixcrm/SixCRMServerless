'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;

module.exports.graphObj = new GraphQLObjectType({
    name: 'NotificationSettingSubGroup',
    description: 'A notification setting subgroup.',
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
        }
    }),
    interfaces: []
});
