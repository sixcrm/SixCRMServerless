
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

let addressInputType = require('../address/addressInputType');
let userACLInputType = require('../useracl/userACLInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'UserInput',
	fields: () => ({
		id:			{ type: GraphQLString },
		name:		{ type: new GraphQLNonNull(GraphQLString) },
		first_name: { type: GraphQLString },
		last_name:	{ type: GraphQLString },
		auth0_id:	{ type: new GraphQLNonNull(GraphQLString) },
		active: 	{ type: new GraphQLNonNull(GraphQLBoolean) },
		termsandconditions: 	{ type: GraphQLString },
		address:	{ type: addressInputType.graphObj },
		acl:		{ type: new GraphQLList(userACLInputType.graphObj) }
	})
});
