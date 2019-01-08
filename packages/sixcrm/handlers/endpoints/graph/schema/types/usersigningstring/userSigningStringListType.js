
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let paginationType = require('../pagination/paginationType');
let userSigningStringType = require('./userSigningStringType');

module.exports.graphObj =  new GraphQLObjectType({
	name: 'UserSigningStringList',
	description: 'User Signing String.',
	fields: () => ({
		usersigningstrings: {
			type: new GraphQLList(userSigningStringType.graphObj),
			description: 'User Signing Strings.',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
