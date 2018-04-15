
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLInt = require('graphql').GraphQLInt;

let transactionalProductType = require('./transactionalProductType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'WatermarkProducts',
	description: 'A quantity of a specific product sold.',
	fields: () => ({
		quantity:{
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The watermark product quantity.'
		},
		price:{
			type: GraphQLFloat,
			description: 'The watermark product price'
		},
		product:{
			type: new GraphQLNonNull(transactionalProductType.graphObj),
			description: 'The watermark product.'
		}
	}),
	interfaces: []
});
