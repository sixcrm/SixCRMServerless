
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;

let accessKeyType = require('./accessKeyType');
let paginationType = require('../pagination/paginationType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'AccessKeys',
	description: 'Access keys',
	fields: () => ({
		accesskeys: {
			type: new GraphQLList(accessKeyType.graphObj),
			description: 'The access keys',
		},
		pagination: {
			type: paginationType.graphObj,
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
