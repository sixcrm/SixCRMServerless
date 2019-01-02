
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLList = require('graphql').GraphQLList;

const returnHistoryInputType = require('./returnHistoryInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'returnTransactionProductInputType',
	fields: () => ({
		alias: {
			type: new GraphQLNonNull(GraphQLString)
		},
		product: {
			type: new GraphQLNonNull(GraphQLString)
		},
		quantity:{
			type: new GraphQLNonNull(GraphQLInt)
		},
		history: {
			type: new GraphQLList(returnHistoryInputType.graphObj)
		}
	})
});
