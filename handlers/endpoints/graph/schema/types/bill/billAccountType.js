
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'billAccount',
	description: 'A owner account of a bill.',
	fields: () => ({
		id:{
			type: new GraphQLNonNull(GraphQLString),
			description: 'The ID of the account.',
			resolve: (account) => account.id
		},
		name:{
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the account.',
			resolve: (account) => account.name
		}
	}),
	interfaces: []
});
