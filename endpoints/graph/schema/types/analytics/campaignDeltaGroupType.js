'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
    name: 'CampaingDeltaGroupType',
    description: 'The campaign delta campaigns',
    fields: () => ({
        campaign:{
            type: new GraphQLNonNull(GraphQLString),
            description: 'The campaign ID'
        },
        campaign_name:{
            type: new GraphQLNonNull(GraphQLString),
            description: 'The campaign name'
        },
        percent_change_amount:{
            type: new GraphQLNonNull(GraphQLString),
            description: 'The percent change (currency)'
        },
        percent_change_count:{
            type: new GraphQLNonNull(GraphQLString),
            description: 'The percent change (amount)'
        }
    }),
    interfaces: []
});
