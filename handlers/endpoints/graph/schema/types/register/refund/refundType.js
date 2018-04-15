
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLJSON = require('graphql-type-json');

let transactionType = require('../../transaction/transactionType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Refund',
	description: 'Credits funds to a customer based on pre-existing transaction.',
	fields: () => ({
		transaction: {
			type: transactionType.graphObj,
			description: 'The transaction record that was created as a result of the refund.'
		},
		processor_response: {
			type: new GraphQLNonNull(GraphQLJSON),
			description: 'The refund response from the merchant provider.'
		}
	})
});
