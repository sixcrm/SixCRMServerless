
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let paginationType = require('../pagination/paginationType');
let roleType = require('./roleType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Roles',
	description: 'Roles',
	fields: () => ({
		roles: {
			type: new GraphQLList(roleType.graphObj),
			description: 'The roles',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
