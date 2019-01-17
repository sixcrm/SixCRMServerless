
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
	name: 'BINType',
	description: 'A record denoting BIN information.',
	fields: () => ({
		binnumber: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The BIN number'
		},
		brand: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The brand'
		},
		bank: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The bank'
		},
		type: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The type'
		},
		level: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The level'
		},
		country: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The country'
		},
		info: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The info'
		},
		country_iso: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The country ISO'
		},
		country2_iso: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The country 2 ISO'
		},
		country3_iso: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The country 3 ISO'
		},
		webpage: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The webpage'
		},
		phone: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The phone number'
		}
	}),
	interfaces: []
});
