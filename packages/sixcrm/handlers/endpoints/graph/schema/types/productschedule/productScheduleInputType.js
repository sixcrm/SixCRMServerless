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
		trial_required: { type: GraphQLBoolean },
		trial_sms_provider:  { type: GraphQLString },
		updated_at:     { type: GraphQLString }
	})
});

const nextCycleReducer = ({ schedules, position, end }) => {
	if (!end) {
		return position;
	}
	if (schedules.length > position) {
		return position + 1;
	}

	return null;
}

const sortedScheduleReducer = (
	cycles,
	{ start, end, price, product, samedayofmonth },
	index,
	schedules
) => {
	const position = index + 1;
	const nextCycle = nextCycleReducer({ schedules, position, end });

	return [
		...cycles,
		{
			length: {
				[samedayofmonth ? "months" : "days"]: samedayofmonth ? 1 : end - start
			},
			position,
			nextCycle,
			price,
			shippingPrice: 0,
			products: [product]
		}
	];
};

module.exports.toProductScheduleInput = ({
	cycles,
	schedule,
	...productScheduleInput
}) => ({
	...productScheduleInput,
	cycles: cycles ? cycles : sortBy(schedule, 'start').reduce(sortedScheduleReducer, [])
});