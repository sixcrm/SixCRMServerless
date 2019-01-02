
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'TrackerInput',
	fields: () => ({
		id:			{ type: GraphQLString },
		affiliates:	{ type: new GraphQLList(GraphQLString) },
		campaigns:	{ type: new GraphQLList(GraphQLString) },
		type:       { type: new GraphQLNonNull(GraphQLString) },
		event_type: { type: new GraphQLList(GraphQLString) },
		body:       { type: new GraphQLNonNull(GraphQLString) },
		name:       { type: GraphQLString },
		updated_at: { type: GraphQLString }
	})
});
