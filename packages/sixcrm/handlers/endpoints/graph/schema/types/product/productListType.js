const {
	GraphQLObjectType,
	GraphQLList
} = require('graphql');
const productType = require('./productType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Products',
	description: 'Products for sale.',
	fields: () => ({
		products: {
			type: new GraphQLList(productType.graphObj),
			description: 'The products',
		}
	}),
	interfaces: []
});
