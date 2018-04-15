
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;

let imageDimensionsInputType = require('./imageDimensionsInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'ImageInput',
	fields: () => ({
		path:              { type: new GraphQLNonNull(GraphQLString) },
		dimensions: { type: imageDimensionsInputType.graphObj },
		name: { type: GraphQLString },
		default_image: { type: GraphQLBoolean },
		description: { type: GraphQLString },
		format: { type: GraphQLString }
	})
});
