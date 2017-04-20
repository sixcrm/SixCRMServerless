'use strict';
const GraphQLEnumType = require('graphql').GraphQLEnumType;

module.exports.graphObj = new GraphQLEnumType({
    name: 'FulfillmentProviderProcessors',
    description: 'Whitelisted Fulfillment Provider Processors',
    values: {
        HASHTAG: {
            value: 'HASHTAG'
        }
    }
});
