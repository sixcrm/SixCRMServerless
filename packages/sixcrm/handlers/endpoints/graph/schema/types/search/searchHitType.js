const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
	name: 'SearchResultHit',
	description: 'Search Result Hit.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Search Result ID',
		},
		fields: {
			type: GraphQLString,
			description: 'Search Result fields.'
		}
	}),
	interfaces: []
});
