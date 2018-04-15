
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'AffiliateInput',
	fields: () => ({
		id:					{ type: GraphQLString },
		affiliate_id:		{ type: new GraphQLNonNull(GraphQLString) },
		name: { type: GraphQLString },
		updated_at: { type: GraphQLString }
	})
});
