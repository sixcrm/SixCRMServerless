
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

let addressInputType = require('../address/addressInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'CreditCardPartialInput',
	fields: () => ({
		number:			{ type: GraphQLString },
		expiration:			{ type: GraphQLString },
		name:				{ type: GraphQLString },
		address:			{ type: addressInputType.graphObj },
	})
});
