const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLJSON = require('graphql-type-json');

module.exports.graphObj = new GraphQLObjectType({
	name: 'FeatureFlags',
	description: 'Latest Terms and Conditions.',
	fields: () => ({
		configuration: {
			type: new GraphQLNonNull(GraphQLJSON),
			description: 'Feature Flags Configuration Settings',
		}
	}),
	interfaces: []
});
