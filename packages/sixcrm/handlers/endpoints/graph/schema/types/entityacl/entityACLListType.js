
const {
	GraphQLNonNull,
	GraphQLList,
	GraphQLObjectType
} = require('graphql');

let entityACLType = require('./entityACLType');
let paginationType = require('../pagination/paginationType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'EntityACLs',
	description: 'Entity ACLs.',
	fields: () => ({
		entityacls: {
			type: new GraphQLList(entityACLType.graphObj),
			description: 'The acls',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
