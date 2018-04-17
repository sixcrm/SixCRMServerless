const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'ConnectionTestResult',
	description: 'Connection Test Result',
	fields: () => ({
		status: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Connection Status',
		},
		message: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'Connection Message',
		}
	}),
	interfaces: []
});
