import ProductSchedule from "../../models/ProductSchedule";
import DynamoDB = require("aws-sdk/clients/dynamodb");
import _ = require('lodash');

const nextPositionReducer = ({ schedules, position, end }) => {
	if (!end) {
		return position;
	}
	if (schedules.length > position) {
		return position + 1;
	}

	return null;
};

const lengthReducer = ({ samedayofmonth, period, start, end }) => {
	if (samedayofmonth) {
		return '1 month';
	}

	const days = end ? end - start : period;
	return `${days} days`;
};

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

export class DynamoProductSchedule {

	static fromArray(items: any[]) {
		return items.map(d => new DynamoProductSchedule(d));
	}
	readonly id: string;
	readonly name: string;
	readonly account: string;
	readonly created_at: string;
	readonly updated_at: string;
	readonly trial_required: boolean;
	readonly schedule: any[];
	readonly merchantprovidergroup: string;

	constructor(data: any) {
		this.id = this.get(data, 'id.S');
		this.name = this.get(data, 'name.S');
		this.account = this.get(data, 'account.S');
		this.created_at = this.get(data, 'created_at.S');
		this.updated_at = this.get(data, 'updated_at.S');
		this.trial_required = this.get(data, 'trial_required.BOOL');
		this.merchantprovidergroup = this.get(data, 'merchantprovidergroup.S');
		this.schedule = DynamoDB.Converter.unmarshall(data).schedule;
	}

	toProductSchedule() : ProductSchedule {
		const cycles = DynamoProductSchedule.cyclesFromSchedule(this.schedule);

		return Object.assign(new ProductSchedule(this.id, this.account, this.name.substring(0, 55).trim(), !!this.trial_required),{
			created_at: new Date(this.created_at),
			updated_at: new Date(this.updated_at),
			merchant_provider_group_id: this.merchantprovidergroup,
			cycles

		});
	}

	static cyclesFromSchedule(schedule) {
		let cycles = _.sortBy(schedule, 'start').reduce(sortedScheduleReducer, []);
		cycles = cycles.map(({cycle_products, ...cycle}) => ({
			...cycle,
			cycle_products: cycle_products.map(({product, ...cycleProduct}) => ({
				...cycleProduct,
				product: {id: product}
			}))
		}));
		return cycles;
	}

	private get(object: any, path: string): any {
		return path.split('.').reduce((prev, next) => (prev && prev[next]) ? prev[next] : null, object);
	}

}
