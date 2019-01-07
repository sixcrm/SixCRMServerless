
const GraphQLEnumType = require('graphql').GraphQLEnumType;

module.exports.graphObj = new GraphQLEnumType({
	name: 'EmailTemplateEntityTypeEnumeration',
	values: {
		campaign: {
			value: 'campaigns'
		},
		product: {
			value: 'products'
		},
		product_schedule: {
			value: 'product_schedules'
		}
	}
});
