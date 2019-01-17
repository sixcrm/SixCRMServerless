
const GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let customerType = require('./customerType');

module.exports.graphObj = new GraphQLInterfaceType({
	name: 'customer',
	description: 'A customer',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the customer.',
		},
		firstname: {
			type: GraphQLString,
			description: 'The firstname of the customer.',
		},
		lastname: {
			type: GraphQLString,
			description: 'The lastname of the customer.',
		},
		email: {
			type: GraphQLString,
			description: 'Email of the customer.',
		}
	}),
	resolveType(/*customer*/) {
		return customerType;
	}
});
