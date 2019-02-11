
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'SMSProviderInput',
	fields: () => ({
		id:					{ type: GraphQLString },
		account:			{ type: GraphQLString },
		name:				{ type: GraphQLString },
		type:				{ type: GraphQLString },
		api_account:		{ type: GraphQLString },
		api_token:			{ type: GraphQLString },
		from_number:		{ type: GraphQLString },
		updated_at: 		{ type: GraphQLString }
	})
});
