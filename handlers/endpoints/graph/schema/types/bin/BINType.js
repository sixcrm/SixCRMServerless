
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
	name: 'dynamoBINType',
	description: 'A record denoting BIN information.',
	fields: () => ({
		binnumber: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The BIN number'
		},
		brand: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The brand'
		},
		bank: {
			type: GraphQLString,
			description: 'The bank'
		},
		type: {
			type: GraphQLString,
			description: 'The type'
		},
		level: {
			type: GraphQLString,
			description: 'The level'
		},
		country: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The country'
		},
		info: {
			type:GraphQLString,
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
			type: GraphQLString,
			description: 'The country 3 ISO'
		},
		webpage: {
			type: GraphQLString,
			description: 'The webpage'
		},
		phone: {
			type: GraphQLString,
			description: 'The phone number'
		}
	}),
	interfaces: []
});
