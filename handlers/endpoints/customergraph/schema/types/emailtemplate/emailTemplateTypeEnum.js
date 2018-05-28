
const GraphQLEnumType = require('graphql').GraphQLEnumType;

module.exports.graphObj = new GraphQLEnumType({
	name: 'EmailTemplateTypeEnumeration',
	description:  'The various email template types.',
	values:{
		ALLORDERS: {
			value: 'allorders',
		},
		INITIALORDERS: {
			value: 'initialorders'
		},
		INITIALFULFILLMENT: {
			value: 'initialfulfillment'
		},
		RECURRINGORDER: {
			value: 'recurringorder'
		},
		RECURRINGFULFILLMENT: {
			value: 'recurringfulfillment'
		},
		RECURRINGDECLINE: {
			value: 'recurringdecline'
		},
		CANCELLATION: {
			value: 'cancellation'
		},
		RETURNTOMANUFACTURER: {
			value: 'returntomanufacturer'
		},
		REFUNDREVERSE: {
			value: 'refundreverse'
		}
	}
});
