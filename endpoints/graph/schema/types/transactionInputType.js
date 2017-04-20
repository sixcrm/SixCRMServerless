const GraphQLList = require('graphql').GraphQLList;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
let transactionProductInputType = require('./transactionProductInputType');

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'TransactionInputType',
    fields: () => ({
        id:					{ type: new GraphQLNonNull(GraphQLString) },
        rebill_id:			{ type: new GraphQLNonNull(GraphQLString) },
        amount:				{ type: new GraphQLNonNull(GraphQLFloat) },
        processor_response:	{ type: new GraphQLList(GraphQLString) },
        products:			{ type: new GraphQLList(transactionProductInputType.graphObj) }
    })
});
