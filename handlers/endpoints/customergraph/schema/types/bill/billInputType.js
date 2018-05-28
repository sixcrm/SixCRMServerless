
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

const billDetailItemInputType = require('./billDetailItemInputType.js');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'BillInputType',
	fields: () => ({
		id:             { type: GraphQLString },
		account:        { type: new GraphQLNonNull(GraphQLString) },
		detail:         { type: new GraphQLList(billDetailItemInputType.graphObj) },
		paid:           { type: new GraphQLNonNull(GraphQLBoolean) },
		paid_result:    { type: GraphQLString },
		outstanding:    { type: GraphQLBoolean },
		period_end_at:  { type: new GraphQLNonNull(GraphQLString) },
		period_start_at:{ type: new GraphQLNonNull(GraphQLString) },
		available_at:   { type: new GraphQLNonNull(GraphQLString) },
		updated_at:     { type: GraphQLString }
	})
});
