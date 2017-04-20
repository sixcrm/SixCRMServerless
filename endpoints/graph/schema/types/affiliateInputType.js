'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'AffiliateInput',
    fields: () => ({
        id:					{ type: new GraphQLNonNull(GraphQLString) },
        affiliate_id:		{ type: new GraphQLNonNull(GraphQLString) },
        sub_id_1:			{ type: new GraphQLNonNull(GraphQLString) },
        sub_id_2:			{ type: new GraphQLNonNull(GraphQLString) },
        sub_id_3:			{ type: new GraphQLNonNull(GraphQLString) },
        sub_id_4:			{ type: new GraphQLNonNull(GraphQLString) },
        sub_id_5:			{ type: new GraphQLNonNull(GraphQLString) },
        click_id:			{ type: new GraphQLNonNull(GraphQLString) }
    })
});
