
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'SMSValidationInput',
	fields: () => ({
		recipient_phone:{ type: new GraphQLNonNull(GraphQLString) },
		smsprovider:	{ type: new GraphQLNonNull(GraphQLString) }
	})
});
