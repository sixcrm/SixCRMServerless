
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

let addressInputType = require('../address/addressInputType')

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'CustomerInputType',
	fields: () => ({
		id:					{ type: GraphQLString },
		firstname:			{ type: new GraphQLNonNull(GraphQLString) },
		lastname:			{ type: new GraphQLNonNull(GraphQLString) },
		email:				{ type: new GraphQLNonNull(GraphQLString) },
		phone:				{ type: new GraphQLNonNull(GraphQLString) },
		address:			{ type: new GraphQLNonNull(addressInputType.graphObj) },
		default_creditcard: { type: GraphQLString },
		creditcards:		{ type: new GraphQLList(GraphQLString) },
		updated_at:     { type: GraphQLString }
	})
});
