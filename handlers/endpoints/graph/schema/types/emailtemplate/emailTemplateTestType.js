
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'EmailTemplateTest',
	description: 'Send a test email with template.',
	fields: () => ({
		result: {
			type: GraphQLString,
			description: 'OK',
		}
	}),
	interfaces: []
});
