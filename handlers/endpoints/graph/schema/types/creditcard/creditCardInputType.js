const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLList = require('graphql').GraphQLList;

let addressInputType = require('../address/addressInputType')

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'CreditCardInput',
	fields: () => ({
		id: {
			type: GraphQLString
		},
		number: {
			type: new GraphQLNonNull(GraphQLString)
		},
		expiration: {
			type: new GraphQLNonNull(GraphQLString)
		},
		name: {
			type: new GraphQLNonNull(GraphQLString)
		},
		address: {
			type: new GraphQLNonNull(addressInputType.graphObj)
		},
		customers: {
			type: new GraphQLList(GraphQLString)
		},
		updated_at: {
			type: GraphQLString
		}
	})
});
