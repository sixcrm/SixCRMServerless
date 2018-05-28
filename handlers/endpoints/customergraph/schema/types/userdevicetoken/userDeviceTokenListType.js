
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let userDeviceTokenType = require('./userDeviceTokenType');
let paginationType = require('../pagination/paginationType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'UserDeviceTokenList',
	description: 'User Device Tokens',
	fields: () => ({
		userdevicetokens: {
			type: new GraphQLList(userDeviceTokenType.graphObj),
			description: 'The user device tokens',
		},
		//Technical Debt: Note that the paginationType here is not GraphQLNonNull because it's using a query method that doesn't return that information
		pagination: {
			type: paginationType.graphObj,
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
