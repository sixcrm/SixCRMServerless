
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'LinearUnitOfMeasurementInput',
	fields: () => ({
		units:              { type: new GraphQLNonNull(GraphQLFloat) },
		unitofmeasurement:  { type: new GraphQLNonNull(GraphQLString) }
	})
});
