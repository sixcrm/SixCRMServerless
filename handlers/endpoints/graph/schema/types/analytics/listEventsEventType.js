'use strict';
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

module.exports.graphObj = new GraphQLObjectType({
    name: 'listEventsEventType',
    description: 'A record denoting a event.',
    fields: () => ({
        session: {
            type: new GraphQLNonNull(GraphQLString),
            description: ''
        },
			  type: {
      type: new GraphQLNonNull(GraphQLString),
      description: ''
  },
			  datetime: {
      type: new GraphQLNonNull(GraphQLString),
      description: ''
  },
			  account: {
      type: new GraphQLNonNull(GraphQLString),
      description: ''
  },
			  campaign: {
      type: new GraphQLNonNull(GraphQLString),
      description: ''
  },
			  product_schedule: {
      type: new GraphQLNonNull(GraphQLString),
      description: ''
  },
			  affiliate: {
      type: GraphQLString,
      description: ''
  },
			  subaffiliate_1: {
      type: GraphQLString,
      description: ''
  },
			  subaffiliate_2: {
      type: GraphQLString,
      description: ''
  },
			  subaffiliate_3: {
      type: GraphQLString,
      description: ''
  },
			  subaffiliate_4: {
      type: GraphQLString,
      description: ''
  },
			  subaffiliate_5: {
      type: GraphQLString,
      description: ''
  }
    }),
    interfaces: []
});
