
const {
	GraphQLObjectType,
	GraphQLString
} = require('graphql');

module.exports.graphObj = new GraphQLObjectType({
	name: 'CustomEmailTemplateBlock',
	fields: () => ({
		id: { type: GraphQLString },
		title: { type: GraphQLString },
		body: { type: GraphQLString }
	})
});
