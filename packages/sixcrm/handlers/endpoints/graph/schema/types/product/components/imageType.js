
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;

let imageDimensionsType = require('./imageDimensionsType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'ImageType',
	description: 'Image Type',
	fields: () => ({
		path: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The product image path',
		},
		dimensions: {
			type: imageDimensionsType.graphObj,
			description: '`dimensions` will be removed.`',
			deprecationReason: 'The `dimensions` field is deprecated and will be removed soon.',
		},
		name: {
			type: GraphQLString,
			description: '`name` will be removed.`',
			deprecationReason: 'The `name` field is deprecated and will be removed soon.',
		},
		default_image: {
			type: GraphQLBoolean,
			description: '`default_image` will be removed. Use `Product.defaultImage` instead.',
			deprecationReason: 'The `default_iamge` field is deprecated and will be removed soon.',
		},
		description: {
			type: GraphQLString,
			description: '`description` will be removed.`',
			deprecationReason: 'The `description` field is deprecated and will be removed soon.',
		},
		format: {
			type: GraphQLString,
			description: '`format` will be removed.`',
			deprecationReason: 'The `format` field is deprecated and will be removed soon.',
		}
	}),
	interfaces: []
});

module.exports.toImage = imageUrl => ({ path: imageUrl });