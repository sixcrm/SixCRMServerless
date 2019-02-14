
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let paginationType = require('../pagination/paginationType');
let SMSProviderType = require('./SMSProviderType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'SMSProvider',
	description: 'SMS Providers.',
	fields: () => ({
		smsproviders: {
			type: new GraphQLList(SMSProviderType.graphObj),
			description: 'The SMS providers',
		},
		pagination: {
			type: new GraphQLNonNull(paginationType.graphObj),
			description: 'Query pagination',
		}
	}),
	interfaces: []
});
