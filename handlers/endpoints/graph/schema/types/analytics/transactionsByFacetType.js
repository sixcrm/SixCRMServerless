
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInt = require('graphql').GraphQLInt;

const transactionsByFacetGroupType = require('./transactionsByFacetGroupType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'TransactionByFacetType',
	description: 'Transaction by Facet',
	fields: () => ({
		count: {
			type: new GraphQLNonNull(GraphQLInt),
			description: 'Placeholder',
		},
		facet_type: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The facet type',
		},
		facets:{
			type: new GraphQLList(transactionsByFacetGroupType.graphObj),
			description: 'The facets'
		}
	}),
	interfaces: []
});
