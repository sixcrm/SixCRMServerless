
const GraphQLObjectType = require('graphql').GraphQLObjectType;

const transactionOverviewGroupType = require('./transactionOverviewGroupType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionOverviewType',
    description: 'Transaction Overview',
    fields: () => ({
        overview: {
            type: transactionOverviewGroupType.graphObj,
            description: 'The transaction overview groups',
        }
    }),
    interfaces: []
});
