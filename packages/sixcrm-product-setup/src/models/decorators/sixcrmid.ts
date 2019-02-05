import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

const UUID = new RegExp('^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$');

export function IsSixCRMId() {
	return (object: object, propertyName: string) => {
		registerDecorator({
			name: "isSixCRMId",
			target: object.constructor,
			propertyName,
			validator: {
				validate(value: any) {
					return  typeof value === "string" && value === "*" || UUID.test(value);
				}
			}
		});
	};
}
