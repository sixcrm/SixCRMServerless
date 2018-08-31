
const {
	GraphQLInputObjectType,
	GraphQLString,
	GraphQLList
} = require('graphql');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'EmailTemplateSettingsInputType',
	fields: () => ({
		custom_blocks: { type: new GraphQLList(GraphQLString) },
		color_primary: { type: GraphQLString }
	})
});
