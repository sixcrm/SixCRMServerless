const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;

let transactionalScheduleInputType = require('./transactionalScheduleInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'TransactionalProductScheduleInput',
	description: 'A transactional product schedule.',
	fields: () => ({
		id: {
			type: GraphQLString,
			description: 'The id of product schedule.',
		},
		name: {
			type: GraphQLString,
			description: 'The name of product schedule.',
		},
		schedule: {
			type: new GraphQLList(transactionalScheduleInputType.graphObj),
			description: 'The schedules associated with the product schedule'
		},
		merchantprovidergroup: {
			type: GraphQLString,
			description: 'The merchant provider group associated with the product schedule.'
		}
	}),
	interfaces: []
});
