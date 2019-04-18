import { merge, sortBy } from 'lodash';
import ProductSchedule from "../ProductSchedule";
import Cycle, { IProductScheduleInterval } from '../Cycle';
import Product from "../Product";

export default class LegacyProductSchedule {
	public account;
	public created_at;
	public id;
	public name;
	public schedule;
	public trial_required;
	public trial_sms_provider;
	public updated_at;

	constructor({ account, created_at, id, name, schedule, trial_required = false, trial_sms_provider, updated_at }: any) {
		this.account = account;
		this.created_at = created_at;
		this.id = id;
		this.name = name;
		this.schedule = schedule;
		this.trial_required = trial_required;
		if (trial_sms_provider) {
			this.trial_sms_provider = trial_sms_provider;
		}
		this.updated_at = updated_at;
	}

	public static fromProductSchedule(productSchedule: ProductSchedule): LegacyProductSchedule {
		return new LegacyProductSchedule({
			account: productSchedule.account_id,
			...(productSchedule.created_at ? { created_at: productSchedule.created_at.toISOString() } : {}),
			id: productSchedule.id,
			name: productSchedule.name,
			schedule: LegacyProductSchedule.toLegacySchedule(productSchedule.cycles),
			trial_required: productSchedule.requires_confirmation,
			...(productSchedule.updated_at ? { updated_at: productSchedule.updated_at.toISOString() } : {})
		});
	}

	public static hybridFromProductSchedule(productSchedule: ProductSchedule): LegacyProductSchedule & ProductSchedule {
		return merge({}, productSchedule, LegacyProductSchedule.fromProductSchedule(productSchedule));
	}

	public static toLegacySchedule(cycles: Cycle[]) {
		return sortBy(cycles, 'position').reduce(sortedCyclesReducer, []);
	}
}

const sortedCyclesReducer = (
	schedules,
	{ cycle_products, length, price, position, next_position }: Cycle,
	index
) => {
	const lengthInterval = length as IProductScheduleInterval;
	const start = index === 0 ? 0 : schedules[index - 1].end;
	const end =
		position === next_position
			? null
			: start + (lengthInterval.months ? 30 : lengthInterval.days);
	const period = lengthInterval.months ? 30 : lengthInterval.days;

	const product = cycle_products[0].product;
	const productId = (product as Product).id ? product.id : product;

	return [
		...schedules,
		{
			start,
			end,
			period,
			price,
			product: productId,
			samedayofmonth: !!lengthInterval.months
		}
	];
};
