
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

const merchantProviderSummaryGroupType = require('./merchantProviderSummaryGroupType');
const merchantProviderType = require('../merchantprovider/merchantProviderType.js');

const MerchantProviderController = global.SixCRM.routes.include('entities','MerchantProvider.js');
const merchantProviderController = new MerchantProviderController();

module.exports.graphObj = new GraphQLObjectType({
    name: 'MerchantProviderSummaryType',
    description: 'Merchant Provider Summary',
    fields: () => ({
      merchantprovider:{
        type: new GraphQLNonNull(merchantProviderType.graphObj),
        description: 'The merchant provider.',
        resolve: merchantprovider => merchantProviderController.get({id: merchantprovider.merchantprovider})
      },
      summary:{
        type: new GraphQLNonNull(merchantProviderSummaryGroupType.graphObj),
        description: 'The summary group'
      }
    }),
    interfaces: []
});
