
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLBoolean = require('graphql').GraphQLBoolean;


module.exports.graphObj = new GraphQLInputObjectType({
	name: 'EmailTemplateInput',
	fields: () => ({
		id:					   { type: GraphQLString },
		name:				   { type: new GraphQLNonNull(GraphQLString) },
		subject:			 { type: new GraphQLNonNull(GraphQLString) },
		body:				   { type: GraphQLString },
		type:				   { type: new GraphQLNonNull(GraphQLString) },
		smtp_provider: { type: new GraphQLNonNull(GraphQLString) },
		products: {	type: new GraphQLList(GraphQLString)},
		product_schedules: {type: new GraphQLList(GraphQLString)},
		cycle: {type: GraphQLInt},
		enabled: {type: GraphQLBoolean},
		campaigns: {type: new GraphQLList(GraphQLString)},
		updated_at:    { type: GraphQLString }
	})
});
