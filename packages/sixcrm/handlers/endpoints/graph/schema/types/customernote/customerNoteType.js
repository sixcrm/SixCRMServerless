const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;

let customerType = require('../customer/customerType');
let userType = require('../user/userType');

const CustomerNoteController = global.SixCRM.routes.include('controllers', 'entities/CustomerNote.js');
const customerNoteController = new CustomerNoteController();

module.exports.graphObj = new GraphQLObjectType({
	name: 'CustomerNote',
	description: 'A customer note.',
	fields: () => ({
		id: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The id of the customer note.',
		},
		body: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The body of the customer note.',
		},
		account: {
			type: new GraphQLNonNull(GraphQLString),
			description: 'The account that the customer note belongs to.'
		},
		customer: {
			type: customerType.graphObj,
			description: 'The customer that the note pertains to.',
			resolve: (customernote) => {
				return customerNoteController.getCustomer(customernote);
			}
		},
		user: {
			type: userType.graphObj,
			description: 'The user that created the customer note.',
			resolve: (customernote) => {
				return customerNoteController.getUser(customernote);
			}
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
