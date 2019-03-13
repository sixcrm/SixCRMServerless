const sortBy = require('lodash');
const GraphQLList = require('graphql').GraphQLList;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const GraphQLInputObjectType = require('graphql').GraphQLInputObjectType;

let productScheduleProductConfigurationInputType = require('./productScheduleProductConfigurationInputType');

module.exports.graphObj = new GraphQLInputObjectType({
	name: 'ProductScheduleInputType',
	fields: () => ({
		id:					    { type: GraphQLString },
		name:           { type: GraphQLString },
		schedule:			  { type: new GraphQLList(productScheduleProductConfigurationInputType.graphObj) },
		merchantprovidergroup:  { type: GraphQLString },
		trial_required: { type: GraphQLBoolean, deprecationReason: 'The `trial_required` field is deprecated and will be removed soon.' },
		requires_confirmation: { type: GraphQLBoolean },
		trial_sms_provider:  { type: GraphQLString },
		updated_at:     { type: GraphQLString }
	})
});

const nextPositionReducer = ({ schedules, position, end }) => {
	if (!end) {
		return position;
	}
	if (schedules.length > position) {
		return position + 1;
	}

	return null;
}

const lengthReducer = ({ samedayofmonth, period, start, end }) => {
	if (samedayofmonth) {
		return '1 month';
	}

	const days = end ? end - start : period;
	return `${days} days`;
}

const cycleProductsReducer = ({ product }) => [{
	product,
	quantity: 1,
	is_shipping: true,
	position: 1
}];

const sortedScheduleReducer = (
	cycles,
	{ start, end, period, price, product, samedayofmonth },
	index,
	schedules
) => {
	const position = index + 1;
	const next_position = nextPositionReducer({ schedules, position, end });

	return [
		...cycles,
		{
			length: lengthReducer({ samedayofmonth, period, start, end }),
			position,
			next_position,
			price,
			shipping_price: 0,
			cycle_products: cycleProductsReducer({ product })
		}
	];
};

module.exports.toProductScheduleInput = ({
	cycles,
	schedule,
	requires_confirmation,
	trial_required,
	...productScheduleInput
}) => ({
	...productScheduleInput,
	merchant_provider_group_id: productScheduleInput.merchantprovidergroup,
	requires_confirmation: !!(requires_confirmation || trial_required),
	cycles: cycles ? cycles : sortBy(schedule, 'start').reduce(sortedScheduleReducer, [])
});
