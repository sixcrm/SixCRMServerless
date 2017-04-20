const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'SessionInputType',
    fields: () => ({
        id:					{ type: new GraphQLNonNull(GraphQLString) },
        customer:			{ type: new GraphQLNonNull(GraphQLString) },
        campaign:			{ type: new GraphQLNonNull(GraphQLString) },
        completed:			{ type: new GraphQLNonNull(GraphQLString) },
        affiliate:			{ type: GraphQLString },
        product_schedules:	{ type: new GraphQLList(GraphQLString) }
    })
});
