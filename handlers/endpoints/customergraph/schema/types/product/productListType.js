
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let paginationType = require('../pagination/paginationType');
let productType = require('./productType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Products',
	description: 'Products for sale.',
	fields: () => ({
		products: {
			type: new GraphQLList(productType.graphObj),
			description: 'The products',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
