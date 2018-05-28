
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
	name: 'AccountImageType',
	description: 'A account image.',
	fields: () => ({
		filename: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the file',
		},
		path: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The location of the file',
		}
	})
});
