'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
let accountType  = require('./accountType').graphObj;
let paginationType = require('./paginationType').graphObj;

module.exports.graphObj = new GraphQLObjectType({
    name: 'Accounts',
    description: 'Accounts',
    fields: () => ({
        accounts: {
            type: new GraphQLList(accountType),
            description: 'The accounts',
        },
        pagination: {
            type: new GraphQLNonNull(paginationType),
            description: 'Query pagination',
        }
    }),
    interfaces: []
});
