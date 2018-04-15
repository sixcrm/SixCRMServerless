
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;

let imageType = require('./imageType');
let weightType = require('./weightType');
let dimensionsType = require('./dimensionsType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'ProductAttributes',
	description: 'Product Attributes',
	fields: () => ({
		images: {
			type: new GraphQLList(imageType.graphObj),
			description: 'The product images',
		},
		dimensions: {
			type: dimensionsType.graphObj,
			description: 'The product dimensions'
		},
		weight: {
			type: weightType.graphObj,
			description: 'The product weight'
		}
	}),
	interfaces: []
});
