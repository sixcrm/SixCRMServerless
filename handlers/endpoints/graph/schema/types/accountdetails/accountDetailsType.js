
const {
	GraphQLObjectType,
	GraphQLString
} = require('graphql');

const settings  = require('./emailTemplateSettingsType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'AccountDetails',
	fields: () => ({
		id: { type: GraphQLString },
		company_logo: { type: GraphQLString },
		support_link: { type: GraphQLString },
		emailtemplatesettings: { type: settings.graphObj},
		created_at: { type: GraphQLString },
		updated_at: { type: GraphQLString }
	})
});
