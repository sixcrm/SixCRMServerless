const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLJSON = require('graphql-type-json');

module.exports.graphObj = new GraphQLObjectType({
  name: 'NotificationSetting',
  description: 'A notification setting.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the notification.',
    },
    settings: {
      type: new GraphQLNonNull(GraphQLJSON),
      description: 'The serialized notification settings for the user .',
    },
    created_at: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The date that the settings were created.',
    },
    updated_at: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The date that the settings were updated.',
    }
  }),
  interfaces: []
});
