
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'MerchantProviderCustomerServiceInput',
	fields: () => ({
		email:{
			type: GraphQLString,
			description: 'The merchant provider\'s customer service email address.'
		},
		url:{
			type: GraphQLString,
			description: 'The merchant provider\'s customer service URL'
		},
		description:{
			type: GraphQLString,
			description: 'The merchant provider\'s customer service description'
		},
		phone:{
			type: GraphQLString,
			description: 'The merchant provider\'s customer service phone number'
		}
	})
});
