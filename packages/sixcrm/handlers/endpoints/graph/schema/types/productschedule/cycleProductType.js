const {
	GraphQLObjectType,
	GraphQLInt,
	GraphQLBoolean
} = require('graphql');
const productType = require('../product/productType');


module.exports.graphObj = new GraphQLObjectType({
	name: 'ProductScheduleCycleProductType',
	fields: () => ({
		product:		{ type: productType.graphObj,
			description: 'The product', },
		is_shipping:    { type: GraphQLBoolean },
		position:    { type: GraphQLInt },
		quantity:    { type: GraphQLInt },
	})
});
