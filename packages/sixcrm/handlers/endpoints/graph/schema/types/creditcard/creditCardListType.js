
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let creditCardType = require('./creditCardType')
let paginationType = require('../pagination/paginationType')

module.exports.graphObj = new GraphQLObjectType({
	name: 'CreditCards',
	description: 'Credit cards',
	fields: () => ({
		creditcards: {
			type: new GraphQLList(creditCardType.graphObj),
			description: 'The affiliates',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
