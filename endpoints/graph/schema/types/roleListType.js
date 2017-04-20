let paginationType = require('./paginationType');
const GraphQLNonNull = require('graphql').GraphQLNonNull;
let roleType = require('./roleType');
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
    name: 'Roles',
    description: 'Roles',
    fields: () => ({
        roles: {
            type: new GraphQLList(roleType.graphObj),
            description: 'The roles',
        },
        pagination: {
            type: new GraphQLNonNull(paginationType.graphObj),
            description: 'Query pagination',
        }
    }),
    interfaces: []
});
