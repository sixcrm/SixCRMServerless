
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let customerNoteType = require('./customerNoteType');
let paginationType = require('../pagination/paginationType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'CustomerNotes',
	description: 'Customer Notes',
	fields: () => ({
		customernotes: {
			type: new GraphQLList(customerNoteType.graphObj),
			description: 'The customer notes',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
