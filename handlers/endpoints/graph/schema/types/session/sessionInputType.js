'use strict';
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

let watermarkInputType = require('./watermark/watermarkInputType');

module.exports.graphObj = new GraphQLInputObjectType({
    name: 'SessionInputType',
    fields: () => ({
      id:					        { type: new GraphQLNonNull(GraphQLString) },
      customer:			      { type: new GraphQLNonNull(GraphQLString) },
      campaign:			      { type: new GraphQLNonNull(GraphQLString) },
      completed:			    { type: new GraphQLNonNull(GraphQLBoolean) },
      watermark:          { type: watermarkInputType.graphObj },
      affiliate:			    { type: GraphQLString },
      subaffiliate_1:			{ type: GraphQLString },
      subaffiliate_2:			{ type: GraphQLString },
      subaffiliate_3:			{ type: GraphQLString },
      subaffiliate_4:			{ type: GraphQLString },
      subaffiliate_5:			{ type: GraphQLString },
      cid:			{ type: GraphQLString },
      product_schedules:	{
        type: new GraphQLList(GraphQLString)
      }
    })
});
