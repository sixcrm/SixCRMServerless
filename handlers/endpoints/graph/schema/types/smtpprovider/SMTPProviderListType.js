'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

let paginationType = require('../pagination/paginationType');
let SMTPProviderType = require('./SMTPProviderType');

module.exports.graphObj = new GraphQLObjectType({
    name: 'SMTPProviders',
    description: 'SMTP Providers.',
    fields: () => ({
        smtpproviders: {
            type: new GraphQLList(SMTPProviderType.graphObj),
            description: 'The SMTP providers',
        },
        pagination: {
            type: new GraphQLNonNull(paginationType.graphObj),
            description: 'Query pagination',
        }
    }),
    interfaces: []
});
