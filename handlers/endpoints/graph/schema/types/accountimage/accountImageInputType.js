const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'AccountImageInputType',
	fields: () => ({
		data: {
			type: new GraphQLNonNull(GraphQLString)
		},
		updated_at: {
			type: GraphQLString
		}
	})
});
