const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

const CustomerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');
const customerController = new CustomerController();

let customerInterface = require('./customerInterface');
let addressType = require('../address/addressType');

module.exports.graphObj = new GraphQLObjectType({
	name: 'PublicCustomer',
	description: 'A customer with public fields only.',
	fields: () => ({
		firstname: {
			type: GraphQLString,
			description: 'The firstname of the customer.',
		},
		lastname: {
			type: GraphQLString,
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
		}
	}),
	interfaces: []
});
