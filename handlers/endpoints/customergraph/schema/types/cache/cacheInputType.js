
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'CacheInputType',
	fields: () => ({
		use_cache: { type: GraphQLBoolean }
	})
});
