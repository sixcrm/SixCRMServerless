
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

let transactionalProductInputType = require('./transactionalProductInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'TransactionalScheduleInput',
	fields: () => ({
		price: {
			type: new GraphQLNonNull(GraphQLFloat),
			description: 'The price of schedule.',
		},
		start: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The start of schedule.',
		},
		end: {
			type: GraphQLInt,
			description: 'The end of schedule.',
		},
		period: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The period of schedule.',
		},
		product: {
			type: transactionalProductInputType.graphObj,
			description:  'The product.'
		}
	})
});
