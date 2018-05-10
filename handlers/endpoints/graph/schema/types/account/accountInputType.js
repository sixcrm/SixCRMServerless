
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

const accountBillingInputType = require('./accountBillingInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'AccountInput',
	fields: () => ({
		id:					{ type: GraphQLString },
		name:				{ type: new GraphQLNonNull(GraphQLString) },
		active:				{ type: GraphQLBoolean },
		billing: 		{ type: accountBillingInputType.graphObj },
		updated_at: { type: GraphQLString }
	})
});
