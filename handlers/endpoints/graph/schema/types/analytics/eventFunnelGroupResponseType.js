
const GraphQLString = require('graphql').GraphQLString;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
	name: 'EventFunnelGroupResponseType',
	description: 'Event funnel group response',
	fields: () => ({
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of funnel.'
		},
		count: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The numerical count.'
		},
		percentage: {
			type: new GraphQLNonNull(GraphQLFloat),
			description: 'The percentage relative to to funnel max.'
		},
		relative_percentage: {
			type: new GraphQLNonNull(GraphQLFloat),
			description: 'The percentage relative to to prior funnel event.'
		}
	}),
	interfaces: []
});
