
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'AddressInput',
	fields: () => ({
		line1: { type: new GraphQLNonNull(GraphQLString) },
		line2: { type: GraphQLString },
		city: { type: new GraphQLNonNull(GraphQLString) },
		state: { type: new GraphQLNonNull(GraphQLString) },
		zip: { type: new GraphQLNonNull(GraphQLString) },
		country: { type: new GraphQLNonNull(GraphQLString) },
	})
});
