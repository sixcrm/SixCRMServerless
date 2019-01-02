
const GraphQLList = require('graphql').GraphQLList;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let searchHitType = require('./searchHitType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'SearchResultHits',
	description: 'Search Result Hits.',
	fields: () => ({
		found: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'Search Result Found',
		},
		start: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'Search Result Start',
		},
		hit: {
			type: new GraphQLList(searchHitType.graphObj),
			description: 'Search Result Hit'
		}
	}),
	interfaces: []
});
