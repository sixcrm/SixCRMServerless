
const GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let creditCardType = require('./creditCardType')

module.exports.graphObj = new GraphQLInterfaceType({
	name: 'creditcard',
	description: 'A creditcard',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the creditcard.',
		}
	}),
	resolveType(/*creditcard*/) {
		return creditCardType.graphObj;
	}
});
