
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLList = require('graphql').GraphQLList;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'EventHookInput',
	fields: () => ({
		id:					  { type: GraphQLString },
		name:				  { type: new GraphQLNonNull(GraphQLString) },
		event_type:		{ type: new GraphQLNonNull(new GraphQLList(GraphQLString)) },
		hook:         { type: GraphQLString },
		active:       { type: new GraphQLNonNull(GraphQLBoolean) },
		updated_at:   { type: GraphQLString }
	})
});
