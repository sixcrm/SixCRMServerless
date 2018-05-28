
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let paginationType = require('../pagination/paginationType');
let rebillType = require('./rebillType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Rebills',
	description: 'Orders for rebilling',
	fields: () => ({
		rebills: {
			type: new GraphQLList(rebillType.graphObj),
			description: 'The rebills',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
