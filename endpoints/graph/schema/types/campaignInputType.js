const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'CampaignInputType',
    fields: () => ({
        id:					{ type: new GraphQLNonNull(GraphQLString) },
        name:				{ type: new GraphQLNonNull(GraphQLString) },
        loadbalancer:		{ type: new GraphQLNonNull(GraphQLString) },
        productschedules:	{ type: new GraphQLList(GraphQLString) },
        emailtemplates:		{ type: new GraphQLList(GraphQLString) }
    })
});
