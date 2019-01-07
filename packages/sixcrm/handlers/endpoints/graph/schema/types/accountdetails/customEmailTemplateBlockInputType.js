
const {
	GraphQLInputObjectType,
	GraphQLString
} = require('graphql');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'CustomEmailTemplateBlockInputType',
	fields: () => ({
		id: { type: GraphQLString },
		title: { type: GraphQLString },
		body: { type: GraphQLString }
	})
});
