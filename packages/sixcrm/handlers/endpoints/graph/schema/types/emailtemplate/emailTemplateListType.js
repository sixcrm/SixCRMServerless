
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let emailTemplateType = require('./emailTemplateType');
let paginationType = require('../pagination/paginationType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'EmailTemplates',
	description: 'Email tempates for use.',
	fields: () => ({
		emailtemplates: {
			type: new GraphQLList(emailTemplateType.graphObj),
			description: 'The email templates',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
