'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'UserACLInputType',
    fields: () => ({
  	id:						{ type: new GraphQLNonNull(GraphQLString) },
  	user:					{ type: new GraphQLNonNull(GraphQLString) },
        account:				{ type: new GraphQLNonNull(GraphQLString) },
        role:					{ type: new GraphQLNonNull(GraphQLString) }
    })
});
