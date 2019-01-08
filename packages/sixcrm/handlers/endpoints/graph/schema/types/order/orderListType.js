const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let paginationType = require('../pagination/paginationType');
let orderType = require('./orderType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Orders',
	description: 'Orders',
	fields: () => ({
		orders: {
			type: new GraphQLList(orderType.graphObj),
			description: 'The orders',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
