'use strict';
const GraphQLList = require('graphql').GraphQLList;
const transactionController = require('../../../../controllers/Transaction.js');
const merchantProviderControler = require('../../../../controllers/MerchantProvider.js');
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
let transactionInterface = require('./transactionInterface');
let transactionProductType = require('./transactionProductType');
let rebillType = require('./rebillType');
let merchantProviderType = require('./merchantProviderType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'Transaction',
    description: 'A record denoting transactions.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the transaction.',
        },
        alias: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The alias of the transaction.',
        },
        amount: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The amount of the transaction.',
        },
        processor_response: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The date of the transaction.',
        },
        rebill: {
	        type: rebillType.graphObj,
            description: 'The rebill of the transaction.',
            resolve: transaction => transactionController.getParentRebill(transaction)
        },
        products: {
            type: new GraphQLList(transactionProductType.graphObj),
            description: 'Products associated with the transaction',
            resolve: transaction => transactionController.getTransactionProducts(transaction)
        },
        merchant_provider: {
            type: merchantProviderType.graphObj,
            description: 'Merchant provider associated with the transaction.',
            resolve: transaction => merchantProviderControler.get(transaction.merchant_provider)
        },
        created_at: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'ISO8601 datetime when the entity was created.',
        },
        updated_at: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'ISO8601 datetime when the entity was updated.',
        }
    }),
    interfaces: [transactionInterface.graphObj]
});
