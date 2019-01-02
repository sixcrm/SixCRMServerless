import {ValueObject} from "../ValueObject";
import { v4 } from 'uuid';

export class UUID implements ValueObject<UUID> {

	readonly value: string;

	sameValueAs(other: UUID): boolean {
		return this.value === other.value;
	}

	constructor(value: string = v4()) {
		this.value = value;
	}

	public static of(value: string) {
		return new UUID(value);
	}

	public static copy(uuid: UUID) {
		return new UUID(uuid.value);
	}

}
