
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'WeightType',
	description: 'Weight Type',
	fields: () => ({
		units: {
			type: new GraphQLNonNull(GraphQLFloat),
			description: 'The weight'
		},
		unitofmeasurement: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The unit of measurement'
		}
	}),
	interfaces: []
});
