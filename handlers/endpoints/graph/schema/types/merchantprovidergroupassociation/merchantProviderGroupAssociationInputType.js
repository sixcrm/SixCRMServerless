
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'MerchantProviderGroupAssociationInputType',
	fields: () => ({
		id:	{ type: GraphQLString },
		entity:	{ type: new GraphQLNonNull(GraphQLString) },
		entity_type:	{ type: new GraphQLNonNull(GraphQLString) },
		campaign:	{ type: new GraphQLNonNull(GraphQLString) },
		merchantprovidergroup:	{ type: new GraphQLNonNull(GraphQLString) },
		updated_at: { type: GraphQLString }
	})
});
