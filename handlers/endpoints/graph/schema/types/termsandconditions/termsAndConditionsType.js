

const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'LatestTermsAndConditions',
	description: 'Latest Terms and Conditions.',
	fields: () => ({
		version: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Version of Terms and Conditions.',
		},
		title: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Title of Terms and Conditions.',
		},
		body: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Body of Terms and Conditions.',
		}
	}),
	interfaces: []
});
