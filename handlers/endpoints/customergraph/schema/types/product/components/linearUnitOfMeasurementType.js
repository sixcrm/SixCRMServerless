
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'LinearUnitofMeasurementType',
	description: 'Linear Unit of Measurement Type',
	fields: () => ({
		units: {
			type: new GraphQLNonNull(GraphQLFloat),
			description: 'The units',
		},
		unitofmeasurement: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The unit of measurement'
		}
	}),
	interfaces: []
});
