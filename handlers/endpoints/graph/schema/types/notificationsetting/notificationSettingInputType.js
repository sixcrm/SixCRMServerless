const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLJSON = require('graphql-type-json');

module.exports.graphObj = new GraphQLInputObjectType({
  name: 'NotificationSettingInput',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString)
    },
    settings: {
      type: new GraphQLNonNull(GraphQLJSON)
    },
    updated_at: {
      type: GraphQLString
    }
  })
});
