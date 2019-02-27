const {
	GraphQLObjectType,
	GraphQLList
} = require('graphql');
const paginationType = require('../pagination/paginationType');
const productType = require('./productType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Products',
	description: 'Products for sale.',
	fields: () => ({
		products: {
			type: new GraphQLList(productType.graphObj),
			description: 'The products',
		},
		pagination: {
			type: paginationType.graphObj,
			description: 'Query pagination'
		}
	}),
	interfaces: []
});
