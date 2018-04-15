
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLJSON = require('graphql-type-json');

let transactionType = require('../../transaction/transactionType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Reverse',
	description: 'Reverses a pre-existing customer transaction.',
	fields: () => ({
		transaction: {
			type: transactionType.graphObj,
			description: 'The transaction record that was created as a result of the reverse.'
		},
		processor_response: {
			type: new GraphQLNonNull(GraphQLJSON),
			description: 'The reverse response from the merchant provider.'
		}
	})
});
