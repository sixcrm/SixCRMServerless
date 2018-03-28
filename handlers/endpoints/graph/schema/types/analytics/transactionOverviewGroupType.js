'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const transactionOverviewGroupResponseType = require('./transactionOverviewGroupResponseType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'TransactionOverviewGroupType',
    description: 'The transaction overview groups',
    fields: () => ({
        newsale:{
            type: new GraphQLNonNull(transactionOverviewGroupResponseType.graphObj),
            description: 'New sale overview'
        },
        rebill:{
            type: new GraphQLNonNull(transactionOverviewGroupResponseType.graphObj),
            description: 'Rebill overview'
        },
        decline:{
            type: new GraphQLNonNull(transactionOverviewGroupResponseType.graphObj),
            description: 'Decline overview'
        },
        error:{
            type: new GraphQLNonNull(transactionOverviewGroupResponseType.graphObj),
            description: 'Error overview'
        },
        main:{
            type: new GraphQLNonNull(transactionOverviewGroupResponseType.graphObj),
            description: 'Main overview'
        },
        upsell:{
            type: new GraphQLNonNull(transactionOverviewGroupResponseType.graphObj),
            description: 'Upsell overview'
        }
    }),
    interfaces: []
});
