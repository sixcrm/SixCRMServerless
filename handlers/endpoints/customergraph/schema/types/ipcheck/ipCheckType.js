

const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLObjectType({
	name: 'IPCheck',
	fields: () => ({
		ip_address: { type: new GraphQLNonNull(GraphQLString) }
	})
});
