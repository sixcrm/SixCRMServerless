const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLList = require('graphql').GraphQLList;

module.exports.graphObj = new GraphQLObjectType({
  name: 'NotificationSettingSubGroup',
  description: 'A notification setting subgroup.',
  fields: () => ({
    key: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The notifcation key.'
    },
    channels: {
      type: new GraphQLList(GraphQLString),
      description: 'The notification channel settings'
    }
  }),
  interfaces: []
});
