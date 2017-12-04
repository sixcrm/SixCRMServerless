'use strict';
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

let dateSearchInputType = require('./dateSearchInputType');

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'SearchInputType',
    fields: () => ({
      updated_at:	{ type: dateSearchInputType.graphObj }
    })
});
