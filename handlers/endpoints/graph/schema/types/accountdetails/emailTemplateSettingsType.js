
const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLList
} = require('graphql');

const block  = require('./customEmailTemplateBlockType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'EmailTemplateSettings',
	fields: () => ({
		custom_blocks: { type: new GraphQLList(block.graphObj) },
		color_primary: { type: GraphQLString },
		color_secondary: { type: GraphQLString },
		color_tertiary: { type: GraphQLString }
	})
});
