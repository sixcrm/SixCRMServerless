
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLString = require('graphql').GraphQLString;

module.exports.graphObj = new GraphQLObjectType({
	name: 'merchantprovidercustomerservice',
	description: 'A merchant provider gateway.',
	fields: () => ({
		email:{
			type: GraphQLString,
			description: 'The merchant provider\'s customer service email address.'
		},
		url:{
			type: GraphQLString,
			description: 'The merchant provider\'s customer service URL'
		},
		description:{
			type: GraphQLString,
			description: 'The merchant provider\'s customer service description'
		},
		phone:{
			type: GraphQLString,
			description: 'The merchant provider\'s customer service phone number'
		}
	}),
	interfaces: []
});
