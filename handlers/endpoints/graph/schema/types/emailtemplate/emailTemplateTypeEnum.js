
const GraphQLEnumType = require('graphql').GraphQLEnumType;

module.exports.graphObj = new GraphQLEnumType({
	name: 'EmailTemplateTypeEnumeration',
	description:  'The various email template types.',
	values:{
		INITIALORDERS: {
			value: 'initialorders'
		},
		ALLORDERS: {
			value: 'allorders',
		},
		INITIALFULFILLMENT: {
			value: 'initialfulfillment'
		},
		ALLFULFILLMENTS: {
			value: 'allfulfillments'
		},
		DELIVERY: {
			value: 'delivery'
		},
		CANCELLATION: {
			value: 'cancellation'
		},
		RETURN: {
			value: 'return'
		},
		RETURNTOMANUFACTURER: {
			value: 'returntomanufacturer'
		},
		DECLINE: {
			value: 'decline'
		}
	}
});
