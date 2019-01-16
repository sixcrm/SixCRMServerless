
const {
	GraphQLInputObjectType,
	GraphQLString
} = require('graphql');

const settings = require('./emailTemplateSettingsInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'AccountDetailsInputType',
	fields: () => ({
		id: { type: GraphQLString },
		company_logo: { type: GraphQLString },
		support_link: { type: GraphQLString },
		support_phone: { type: GraphQLString },
		support_email: { type: GraphQLString },
		emailtemplatesettings: { type: settings.graphObj},
		updated_at: { type: GraphQLString }
	})
});
