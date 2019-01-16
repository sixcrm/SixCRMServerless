const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'UserACLTermsAndConditionsInputType',
	fields: () => ({
		useracl: {
			type: new GraphQLNonNull(GraphQLString)
		},
		version: {
			type: new GraphQLNonNull(GraphQLString)
		},
	})
});
