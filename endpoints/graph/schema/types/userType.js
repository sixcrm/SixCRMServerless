'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const userController = require('../../../../controllers/User.js');
const _ = require('underscore');
let userACLType = require('./userACLType');
let accessKeyType = require('./accessKeyType');
let addressType = require('./addressType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'User',
    description: 'A user.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the user',
        },
        name: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The name of the user',
        },
        auth0_id: {
            type: GraphQLString,
            description: 'The auth0_id of the user.',
        },
        active: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The active status of the user',
        },
        termsandconditions:{
	        type: GraphQLString,
            description: 'The accepted Terms and Conditions version.',
        },
        acl:{
            type: new GraphQLList(userACLType.graphObj),
            description: 'The user\'s ACL objects.',
            resolve: (user) => userController.getACL(user)
        },
        accesskey: {
            type: accessKeyType.graphObj,
            description: 'The access_key of the user.',
            resolve: (user) => {
            	if(_.has(user, 'access_key_id')){
            		var id = user.access_key_id

            		return userController.getAccessKey(id);
            	}else{
            		return null;
            	}
            }
        },
        address: {
            type: addressType.graphObj,
            description: 'The address of the user.',
            resolve: (user) => {
            	return userController.getAddress(user);
            }
        },
        created_at: {
	        type: new GraphQLNonNull(GraphQLString),
            description: 'ISO8601 datetime when the entity was created.',
        },
        updated_at: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'ISO8601 datetime when the entity was updated.',
        }
    }),
    interfaces: []
});
