
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLFloat = require('graphql').GraphQLFloat;
//const GraphQLList = require('graphql').GraphQLList;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

//const productScheduleProductConfigurationInputType = require('./productScheduleProductConfigurationInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'ProductScheduleProductConfigurationInputType',
	fields: () => ({
		product:		{ type: new GraphQLNonNull(GraphQLString) },
		price:				{ type: new GraphQLNonNull(GraphQLFloat) },
		start:				{ type: new GraphQLNonNull(GraphQLInt) },
		period:				{ type: new GraphQLNonNull(GraphQLInt) },
		//Technical Debt:  Why is this here?
		//schedule:			{ type: new GraphQLList(productScheduleProductConfigurationInputType.graphObj) },
		end:				  { type: GraphQLInt },
		samedayofmonth: { type: GraphQLBoolean }
	})
});
