'use strict';
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
let addressInputType = require('./addressInputType')

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'CreditCardInput',
    fields: () => ({
  	id:					{ type: GraphQLString },
        ccnumber:			{ type: new GraphQLNonNull(GraphQLString) },
        expiration:			{ type: new GraphQLNonNull(GraphQLString) },
        ccv:				{ type: new GraphQLNonNull(GraphQLString) },
        name:				{ type: new GraphQLNonNull(GraphQLString) },
        address:			{ type: new GraphQLNonNull(addressInputType.graphObj) }
    })
});
