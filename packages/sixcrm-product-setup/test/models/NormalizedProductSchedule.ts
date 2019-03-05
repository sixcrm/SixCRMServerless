import ProductSchedule from "../../src/models/ProductSchedule";
import NormalizedCycle, {NormalizedCycleType} from "./NormalizedCycle";

export interface NormalizedProductScheduleType {
	id: string,
	account_id: string,
	cycles: NormalizedCycleType[],
	name: string,
	merchant_provider_group_id: string,
	requires_confirmation: boolean,
}

export default class NormalizedProductSchedule {
	private readonly normalizedEntity: NormalizedProductScheduleType;

	constructor(entity: ProductSchedule) {
		this.normalizedEntity = {
			id: entity.id,
			account_id: entity.account_id,
			cycles: (entity.cycles || []).map(cycle => NormalizedCycle.of(cycle)),
			name: entity.name,
			merchant_provider_group_id: entity.merchant_provider_group_id,
			requires_confirmation: entity.requires_confirmation
		}
	}

	static of(entity: ProductSchedule) {
		return new NormalizedProductSchedule(entity).valueOf();
	}

	valueOf(): NormalizedProductScheduleType {
		return this.normalizedEntity;
	}
}

