'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
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
        auth0_id:	{ type: new GraphQLNonNull(GraphQLString) },
        active: 	{ type: new GraphQLNonNull(GraphQLString) },
        termsandconditions: 	{ type: GraphQLString },
        address:	{ type: addressInputType.graphObj },
        acl:		{ type: new GraphQLList(userACLInputType.graphObj) }
    })
});
