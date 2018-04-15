const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLList = require('graphql').GraphQLList;

module.exports.graphObj = new GraphQLObjectType({
	name: 'eventhook',
	description: 'A event hook.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the event hook.'
		},
		event_type: {
			type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
			description: 'Event types to trigger hook execution.'
		},
		name: {
			type: GraphQLString,
			description: 'The name of the fulfillment provider instance.'
		},
		hook: {
			type: GraphQLString,
			description: 'The provider configuration.'
		},
		active: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: 'The active status of the event hook.'
		},
		created_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was created.'
		},
		updated_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'ISO8601 datetime when the entity was updated.'
		}
	}),
	interfaces: []
});
