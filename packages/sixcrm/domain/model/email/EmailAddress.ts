import {ValueObject} from "../ValueObject";

// Taken from https://www.regular-expressions.info/email.html
const VALID_EMAIL_ADDRESS_REGEX = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export class EmailAddress implements ValueObject<EmailAddress> {

	readonly address: string;

	constructor(address: string) {
		if (!this.isValid(address)) {
			throw new Error(`Provided email address '${address}' is not valid.`)
		}
		this.address = address;
	}

	sameValueAs(other: EmailAddress): boolean {
		return this.address === other.address;
	}

	private isValid(address: string) {
		return VALID_EMAIL_ADDRESS_REGEX.test(String(address).toLowerCase());
	}

}
