
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
  name: 'CampaingsByAmountGroupType',
  description: 'The campaigns by amount campaigns',
  fields: () => ({
    campaign:{
      type: new GraphQLNonNull(GraphQLString),
      description: 'The campaign ID'
    },
    amount:{
      type: new GraphQLNonNull(GraphQLString),
      description: 'The campaign amount'
    }
  }),
  interfaces: []
});
