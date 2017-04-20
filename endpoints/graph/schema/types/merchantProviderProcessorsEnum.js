'use strict';
const GraphQLEnumType = require('graphql').GraphQLEnumType;

module.exports.graphObj = new GraphQLEnumType({
    name: 'MerchantProviderProcessors',
    description: 'Whitelisted Merchant Provider Processors',
    values: {
        NMI: {
            value: 'NMI'
        }
    }
});
