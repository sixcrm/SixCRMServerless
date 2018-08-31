
const {
	GraphQLInputObjectType,
	GraphQLString,
	GraphQLList
} = require('graphql');

const block  = require('./customEmailTemplateBlockInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'EmailTemplateSettingsInputType',
	fields: () => ({
		custom_blocks: { type: new GraphQLList(block.graphObj) },
		color_primary: { type: GraphQLString }
	})
});
