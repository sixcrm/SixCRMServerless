'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'NotificationSettingInput',
    fields: () => ({
        id:			{ type: new GraphQLNonNull(GraphQLString) },
        settings:	{ type: new GraphQLNonNull(GraphQLString) }
    })
});
