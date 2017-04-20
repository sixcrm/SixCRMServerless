let paginationType = require('./paginationType');
let loadBalancerType = require('./loadBalancerType');
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLObjectType({
    name: 'LoadBalancers',
    description: 'Load Balancers',
    fields: () => ({
        loadbalancers: {
            type: new GraphQLList(loadBalancerType.graphObj),
            description: 'The Load Balancers',
        },
        pagination: {
            type: new GraphQLNonNull(paginationType.graphObj),
            description: 'Query pagination',
        }
    }),
    interfaces: []
});
