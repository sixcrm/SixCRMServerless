
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let linearUnitOfMeasurementType = require('./linearUnitOfMeasurementType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'DimensionsType',
	description: 'Dimensions Type',
	fields: () => ({
		width: {
			type: new GraphQLNonNull(linearUnitOfMeasurementType.graphObj),
			description: 'The width',
		},
		height: {
			type: new GraphQLNonNull(linearUnitOfMeasurementType.graphObj),
			description: 'The height'
		},
		length: {
			type: new GraphQLNonNull(linearUnitOfMeasurementType.graphObj),
			description: 'The length'
		},
	}),
	interfaces: []
});
