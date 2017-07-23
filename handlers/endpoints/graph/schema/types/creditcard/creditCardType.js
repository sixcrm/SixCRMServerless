'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let addressType = require('../address/addressType')

const creditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');

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
