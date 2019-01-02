
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let paginationType = require('../pagination/paginationType');
let returnType = require('./returnType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Returns',
	description: 'Returns',
	fields: () => ({
		returns: {
			type: new GraphQLList(returnType.graphObj),
			description: 'The returns',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
