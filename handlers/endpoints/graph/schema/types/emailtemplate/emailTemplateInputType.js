
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'EmailTemplateInput',
	fields: () => ({
		id:					   { type: GraphQLString },
		name:				   { type: new GraphQLNonNull(GraphQLString) },
		subject:			 { type: new GraphQLNonNull(GraphQLString) },
		body:				   { type: GraphQLString },
		type:				   { type: new GraphQLNonNull(GraphQLString) },
		smtp_provider: { type: new GraphQLNonNull(GraphQLString) },
		updated_at:    { type: GraphQLString }
	})
});
