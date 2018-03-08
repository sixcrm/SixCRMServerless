'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;

let addressType = require('../address/addressType');
let customerType = require('../customer/customerType');

const creditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');
const customerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');

module.exports.graphObj = new GraphQLObjectType({
    name: 'CreditCard',
    description: 'A creditcard',
    fields: () => ({
  	id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The creditcard id',
  },
        number: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The creditcard number',
            resolve: (creditcard) => {
              const CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
              let creditCardHelperController = new CreditCardHelperController();

              return creditCardHelperController.lastFour(creditcard.number);
            }
        },
        expiration: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The creditcard expiration date.',
        },
        ccv: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The creditcard ccv.',
        },
        name: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The creditcard name.',
        },
        address: {
            type: addressType.graphObj,
            description: 'The customer\'s shipping address.',
            resolve: creditcard => creditCardController.getAddress(creditcard),
        },
        customers: {
            type: new GraphQLList(customerType.graphObj),
            description: 'The credit cards\'s customers.',
            resolve: (creditcard) => {

              return customerController.listByCreditCard({creditcard: creditcard})
                .then(object => object.customers)

            }
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
    interfaces: []
});
