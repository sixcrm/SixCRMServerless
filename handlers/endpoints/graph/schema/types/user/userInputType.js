
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

let addressInputType = require('../address/addressInputType');
let userACLInputType = require('../useracl/userACLInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'UserInput',
	fields: () => ({
		id:			{ type: new GraphQLNonNull(GraphQLString) },
		name:		{ type: new GraphQLNonNull(GraphQLString) },
		first_name: { type: GraphQLString },
		last_name:	{ type: GraphQLString },
		alias:  	{ type: GraphQLString },
		auth0_id:	{ type: new GraphQLNonNull(GraphQLString) },
		active: 	{ type: GraphQLBoolean },
		termsandconditions: 	{ type: GraphQLString },
		address:	{ type: addressInputType.graphObj },
		acl:		{ type: new GraphQLList(userACLInputType.graphObj) },
		updated_at: { type: GraphQLString }
	})
});
