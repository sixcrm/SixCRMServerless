
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let paginationType = require('../pagination/paginationType');
let billType = require('./billType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Bills',
	description: 'Bills',
	fields: () => ({
		bills: {
			type: new GraphQLList(billType.graphObj),
			description: 'The bills',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
