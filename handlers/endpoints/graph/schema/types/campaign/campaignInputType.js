
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'CampaignInputType',
	fields: () => ({
		id:					         { type: GraphQLString },
		name:				         { type: new GraphQLNonNull(GraphQLString) },
		description:			   { type: GraphQLString },
		allow_on_order_form: { type: new GraphQLNonNull(GraphQLBoolean) },
		productschedules:	   { type: new GraphQLList(GraphQLString) },
		emailtemplates:		   { type: new GraphQLList(GraphQLString) },
		affiliate_allow:     { type: new GraphQLList(GraphQLString) },
		affiliate_deny:      { type: new GraphQLList(GraphQLString) },
		allow_prepaid:       { type: new GraphQLNonNull(GraphQLBoolean) },
		show_prepaid:        { type: new GraphQLNonNull(GraphQLBoolean) },
		updated_at:          { type: GraphQLString }
	})
});
