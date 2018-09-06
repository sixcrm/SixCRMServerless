
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'EmailTemplatePreview',
	description: 'Preview a template with example data',
	fields: () => ({
		result: {
			type: GraphQLString,
			description: 'Template populated with data',
		}
	}),
	interfaces: []
});
