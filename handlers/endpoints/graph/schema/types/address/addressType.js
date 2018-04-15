
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'Address',
	description: 'A address',
	fields: () => ({
		line1: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The first line of the address.',
		},
		line2: {
			type: GraphQLString,
			description: 'The second line of the address',
		},
		city: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The City of the address.',
		},
		state: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The State of the address.',
		},
		zip: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The ZIP code of the address.',
		},
		country: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The country code of the address.',
		},
	}),
	interfaces: []
});
