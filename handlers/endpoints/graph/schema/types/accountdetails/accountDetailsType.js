
const {
	GraphQLObjectType,
	GraphQLString
} = require('graphql');

module.exports.graphObj = new GraphQLObjectType({
	name: 'AccountDetails',
	fields: () => ({
		id: { type: GraphQLString },
		company_logo: { type: GraphQLString },
		support_link: { type: GraphQLString },
		created_at: { type: GraphQLString },
		updated_at: { type: GraphQLString }
	})
});
