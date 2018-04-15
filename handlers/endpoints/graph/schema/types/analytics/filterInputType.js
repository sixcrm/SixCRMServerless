
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLInt = require('graphql').GraphQLInt;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'AnalyticsFilterInput',
    fields: () => ({
        start: {
            description: 'The transaction summary start daytime.',
            type: GraphQLString
        },
        end: {
            description: 'The transaction summary start daytime.',
            type: GraphQLString
        },
        campaign:{
            description: 'The transaction summary campaign filter list.',
            type: new GraphQLList(GraphQLString)
        },
        affiliate:{
            description: 'The transaction summary affiliate filter list.',
            type: new GraphQLList(GraphQLString)
        },
        subaffiliate_1:{
            description: 'The transaction summary subaffiliate 1 filter list.',
            type: new GraphQLList(GraphQLString)
        },
        subaffiliate_2:{
            description: 'The transaction summary subaffiliate 2 filter list.',
            type: new GraphQLList(GraphQLString)
        },
        subaffiliate_3:{
            description: 'The transaction summary subaffiliate 3 filter list.',
            type: new GraphQLList(GraphQLString)
        },
        subaffiliate_4:{
            description: 'The transaction summary subaffiliate 4 filter list.',
            type: new GraphQLList(GraphQLString)
        },
        subaffiliate_5:{
            description: 'The transaction summary subaffiliate 5 filter list.',
            type: new GraphQLList(GraphQLString)
        },
        merchant_provider:{
            description: 'The transaction summary merchant provider filter list.',
            type: new GraphQLList(GraphQLString)
        },
        transactiontype:{
            description: 'The transaction summary product transaction type filter list.',
            type: new GraphQLList(GraphQLString)
        },
        processorresult:{
            description: 'The transaction summary processor result filter list.',
            type: new GraphQLList(GraphQLString)
        },
        targetperiodcount:{
            description: 'The number of observations that we would like to tend towards.',
            type: GraphQLInt
        }
    })
});
