'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'UserSettingInput',
    fields: () => ({
        id:			{ type: new GraphQLNonNull(GraphQLString) },
        work_phone:	{ type: GraphQLString },
        cell_phone:	{ type: GraphQLString },
        timezone:	{ type: GraphQLString },
        notification_sms:	{ type: GraphQLString },
        notification_email:	{ type: GraphQLString },
        notification_skype:	{ type: GraphQLString },
        notification_slack_webhook:	{ type: GraphQLString },
    })
});
