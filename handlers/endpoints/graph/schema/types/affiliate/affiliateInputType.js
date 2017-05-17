'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'AffiliateInput',
    fields: () => ({
        id:					{ type: new GraphQLNonNull(GraphQLString) },
        affiliate_id:		{ type: new GraphQLNonNull(GraphQLString) }
    })
});
