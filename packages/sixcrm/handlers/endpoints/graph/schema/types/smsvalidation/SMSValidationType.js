
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLJSON = require('graphql-type-json');

module.exports.graphObj = new GraphQLObjectType({
	name: 'SMSValidation',
	description: 'A SMS Validation.',
	fields: () => ({
		sms_response: {
			type: GraphQLJSON,
			description: 'The response from the SMS Server.'
		}
	})
});
