let productScheduleType = require('./productScheduleType');
const GraphQLInterfaceType = require('graphql').GraphQLInterfaceType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLInterfaceType({
    name: 'productschedule',
    description: 'A product schedule',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the productschedule.',
        }
    }),
    resolveType(/*productschedule*/) {
        return productScheduleType.graphObj;
    }
});
