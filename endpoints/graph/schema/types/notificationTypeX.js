const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;

let notificationType = new GraphQLObjectType({
    name: 'Notification',
    description: 'A notification.',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the notification.',
        },
        user: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the user who is an owner of the notification.',
        },
        account: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The id of the account notification is associated with.',
        },
        type: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The type of the notification.',
        },
        action: {
            type: new GraphQLNonNull(GraphQLString),
            description: 'The action associated with the notification.',
        },
        message: {
            type: GraphQLString,
            description: 'Notification message.'
        },
        read_at: {
            type: GraphQLString,
            description: 'ISO8601 datetime at which the user has read the notification.',
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
let list = new GraphQLList(notificationType);

module.exports.list = list;
