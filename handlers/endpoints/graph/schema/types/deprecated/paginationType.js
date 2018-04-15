
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'Pagination',
	description: 'Pagination Assets',
	fields: () => ({
		count: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The number of records returned by the query.',
		},
		end_cursor: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The end cursor of the paginated results.',
		},
		has_next_page: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Boolean that represents whether or not the query has more records available.',
		},
		last_evaluated: {
			type: GraphQLString,
			description: 'Serialized compound key'
		}
	}),
	interfaces: []
});
