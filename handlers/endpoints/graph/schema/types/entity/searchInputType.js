
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
let dateSearchInputType = require('./dateSearchInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'SearchInputType',
	fields: () => ({
		updated_at:	{ type: dateSearchInputType.graphObj },
		created_at:	{ type: dateSearchInputType.graphObj },
		name: {type: GraphQLString },
		active: {type: GraphQLBoolean }
	})
});
