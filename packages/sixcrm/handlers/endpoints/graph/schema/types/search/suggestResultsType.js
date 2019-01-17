
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let suggestTopLevelResultsType = require('./suggestTopLevelResultsType');
let searchStatusType = require('./searchStatusType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'SuggestResults',
	description: 'Suggest Results.',
	fields: () => ({
		status: {
			type: new GraphQLNonNull(searchStatusType.graphObj),
			description: 'Search Result Status',
		},
		suggest: {
			type: new GraphQLNonNull(suggestTopLevelResultsType.graphObj),
			description: 'Search Result Hits',
		}
	}),
	interfaces: []
});
