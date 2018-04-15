
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'ReverseInput',
	fields: () => ({
		transaction:  { type: new GraphQLNonNull(GraphQLString) }
	})
});
