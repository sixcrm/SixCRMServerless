
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

let userNotificationSettingInputType = require('./userNotificationSettingInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'UserSettingInput',
	fields: () => ({
		id:			    { type: new GraphQLNonNull(GraphQLString) },
		work_phone:	    { type: GraphQLString },
		cell_phone:	    { type: GraphQLString },
		timezone:	    { type: GraphQLString },
		language:	    { type: GraphQLString },
		column_preferences: { type: new GraphQLList(GraphQLString) },
		notifications:	{ type: new GraphQLList(userNotificationSettingInputType.graphObj), },
		updated_at: { type: GraphQLString }
	})
});
