'use strict';
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let merchantProviderProcessorsEnum = require('./merchantProviderProcessorsEnum');

module.exports.graphObj = new GraphQLObjectType({
    name: 'merchantprovider',
    description: 'A merchant provider.',
    fields: () => ({
  	id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the merchant provider instance.',
  },
        name: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The name of the merchant provider instance.',
        },
        processor: {
            type: new GraphQLNonNull(merchantProviderProcessorsEnum.graphObj),
            description: 'The processor',
        },
        username: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The end of schedule.',
        },
        password: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The period of schedule.',
        },
        endpoint: {
	  type: new GraphQLNonNull(GraphQLString),
            description:'The product associated with the schedule'
        },
        created_at: {
	  type: new GraphQLNonNull(GraphQLString),
            description: 'ISO8601 datetime when the entity was created.',
        },
        updated_at: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'ISO8601 datetime when the entity was updated.',
        }
    }),
    interfaces: []
});
