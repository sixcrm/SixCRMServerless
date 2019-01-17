
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let customerType = require('./customerType');
let paginationType = require('../pagination/paginationType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Customers',
	description: 'Customers',
	fields: () => ({
		customers: {
			type: new GraphQLList(customerType.graphObj),
			description: 'The customers',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
