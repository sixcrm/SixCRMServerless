const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

const CustomerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');
const customerController = new CustomerController();

let customerInterface = require('./customerInterface');
let creditCardType = require('../creditcard/creditCardType');
let addressType = require('../address/addressType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'Customer',
	description: 'A customer.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the customer.',
		},
		firstname: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The firstname of the customer.',
		},
		lastname: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The lastname of the customer.',
		},
		phone: {
			type: GraphQLString,
			description: 'The phone number of the customer.',
		},
		email: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The name of the customer.',
		},
		address: {
			type: addressType.graphObj,
			description: 'The customer\'s shipping address.',
			resolve: customer => customerController.getAddress(customer),
		},
		default_creditcard:{
			type: GraphQLString,
			description:  'The default creditcard for the customer.'
		},
		creditcards: {
			type: new GraphQLList(creditCardType.graphObj),
			description: 'The creditcards associated with the customer',
			resolve: customer => customerController.getCreditCards(customer)
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
	interfaces: [customerInterface.graphObj]
});
