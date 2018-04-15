
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInt = require('graphql').GraphQLInt;

module.exports.graphObj = new GraphQLObjectType({
	name: 'ImageDimensionsType',
	description: 'Image Dimensions Type',
	fields: () => ({
		width: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The image width',
		},
		height: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'The image height'
		},
	}),
	interfaces: []
});
