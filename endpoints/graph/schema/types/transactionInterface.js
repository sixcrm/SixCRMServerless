const GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;
let transactionType = require('./transactionType').graphObj;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLInterfaceType({
    name: 'transaction',
    description: 'A tranasaction',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the transaction.',
        }
    }),
    resolveType() {
        return transactionType;
    }
});
