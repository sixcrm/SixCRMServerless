
const GraphQLList = require('graphql').GraphQLList;
const GraphQLObjectType = require('graphql').GraphQLObjectType;

const queueMessageType = require('./queueMessageType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'listQueueMessageType',
	description: 'Messages List in a Queue',
	fields: () => ({
		queuemessages: {
			type: new GraphQLList(queueMessageType.graphObj),
			description: 'Messages',
		}
	}),
	interfaces: []
});
