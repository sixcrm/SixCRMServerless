'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let userType = require('./userType');
let paginationType = require('../pagination/paginationType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'Users',
    description: 'Users for sale.',
    fields: () => ({
        users: {
            type: new GraphQLList(userType.graphObj),
            description: 'The products',
        },
        pagination: {
            type: new GraphQLNonNull(paginationType.graphObj),
            description: 'Query pagination',
        }
    }),
    interfaces: []
});
