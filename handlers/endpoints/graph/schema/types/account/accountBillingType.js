const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'AccountBilling',
	description: 'A account.',
	fields: () => ({
		plan: {
			type: GraphQLString,
			description: 'The billing plan',
		},
		session: {
			type: GraphQLString,
			description: 'The session associated with the billing plan',
		},
		disabled: {
			type: new GraphQLNonNull(GraphQLBoolean),
			description: "Account billing disabled status"
		}
	}),
	interfaces: []
});
