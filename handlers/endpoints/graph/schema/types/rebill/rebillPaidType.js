const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLNonNull = require('graphql').GraphQLNonNull;

module.exports.graphObj = new GraphQLObjectType({
	name: 'RebillPaid',
	description: 'The payment state of a rebill.',
	fields: () => ({
		detail: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The payment detail.',
		},
		updated_at: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The date rebill was last paid.',
		}
	}),
	interfaces: []
});
