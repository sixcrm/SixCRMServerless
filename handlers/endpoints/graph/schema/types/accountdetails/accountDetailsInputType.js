
const {
	GraphQLInputObjectType,
	GraphQLString
} = require('graphql');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'AccountDetailsInputType',
	fields: () => ({
		id: { type: GraphQLString },
		company_logo: { type: GraphQLString },
		support_link: { type: GraphQLString },
		updated_at: { type: GraphQLString }
	})
});
