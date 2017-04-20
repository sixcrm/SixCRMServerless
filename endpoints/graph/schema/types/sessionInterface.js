'use strict';
let sessionType = require('./sessionType');
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;

module.exports.graphObj = new GraphQLInterfaceType({
    name: 'session',
    description: 'A session',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the session.',
        }
    }),
    resolveType() {
        return sessionType.graphObj;
    }
});
