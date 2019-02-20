
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

let productScheduleProductConfigurationInputType = require('./productScheduleProductConfigurationInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'ProductScheduleInputType',
	fields: () => ({
		id:					    { type: GraphQLString },
		name:           { type: GraphQLString },
		schedule:			  { type: new GraphQLList(productScheduleProductConfigurationInputType.graphObj) },
		merchantprovidergroup:  { type: GraphQLString },
		updated_at:     { type: GraphQLString }
	})
});
