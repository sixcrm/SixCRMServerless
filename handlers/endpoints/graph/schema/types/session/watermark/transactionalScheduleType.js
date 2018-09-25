
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let transactionalProductType = require('./transactionalProductType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'TransactionalSchedule',
	description: 'A watermark scheduled product.',
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
			type: transactionalProductType.graphObj,
			description:  'The product.'
		},
		samedayofmonth: {
			type: GraphQLBoolean
		}
	}),
	interfaces: []
});
