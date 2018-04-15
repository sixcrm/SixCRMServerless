const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;

let ProviderInterfaceType = require('./providerType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Hashtag',
	description: 'A Hashtag fullfillment provider.',
	interfaces: [ProviderInterfaceType.graphObj],
	fields: () => ({
		name: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the fulfillment provider.',
		},
		username: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Hashtag (ThreePL) username',
		},
		password: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Hashtag (ThreePL) password',
		},
		threepl_customer_id: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'Hashtag (ThreePL) Customer ID',
		},
		threepl_key: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The bracketed ThreePL Key.',
		}
	})
});
