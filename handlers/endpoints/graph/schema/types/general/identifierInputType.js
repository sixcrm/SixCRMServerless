'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLFloat = require('graphql').GraphQLFloat;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

let transactionProductInputType = require('../transactionproduct/transactionProductInputType');

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'IdentifierInputType',
    fields: () => ({
        id:	{ type: new GraphQLNonNull(GraphQLString) }
    })
});
