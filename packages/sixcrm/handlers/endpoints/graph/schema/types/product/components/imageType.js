
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
			description: 'The product dimensions'
		},
		name: {
			type: GraphQLString,
			description: 'The image name'
		},
		default_image: {
			type: GraphQLBoolean,
			description: 'Is image default'
		},
		description: {
			type: GraphQLString,
			description: 'The image description'
		},
		format: {
			type: GraphQLString,
			description: 'The image format'
		}
	}),
	interfaces: []
});
