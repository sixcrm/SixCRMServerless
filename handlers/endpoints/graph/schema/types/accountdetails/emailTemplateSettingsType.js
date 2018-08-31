
const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLList
} = require('graphql');

module.exports.graphObj = new GraphQLObjectType({
	name: 'EmailTemplateSettings',
	fields: () => ({
		custom_blocks: { type: new GraphQLList(GraphQLString) },
		color_primary: { type: GraphQLString }
	})
});
