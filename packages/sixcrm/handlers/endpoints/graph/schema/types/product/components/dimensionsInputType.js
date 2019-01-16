
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let linearUnitOfMeasurementInputType = require('./linearUnitOfMeasurementInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'DimensionsInput',
	fields: () => ({
		width:			{ type: new GraphQLNonNull(linearUnitOfMeasurementInputType.graphObj) },
		height:			{ type: new GraphQLNonNull(linearUnitOfMeasurementInputType.graphObj) },
		length:			{ type: new GraphQLNonNull(linearUnitOfMeasurementInputType.graphObj) }
	})
});
