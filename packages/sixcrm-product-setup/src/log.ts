import * as Logger from 'js-logger';

Logger.useDefaults({
	defaultLevel: {value: Number(process.env.VERBOSE || 3), name: 'SIX_VERBOSE'},
	formatter: (messages, context) => {
		if (context.name) {
			messages.unshift(`[${context.name}]`);
		}
		messages.unshift(context.level.name);
		messages.unshift(`[${new Date().toISOString()}]`);
	}
});

export function logger(classname: string) {
	return Logger.get(classname);
}

function getMessage(target, key: string | symbol, args, result) {
	let message = `${String(key)}(${args})`;
	if (!(result instanceof Promise)) {
		message += ` === ${result}`;
	}
	return message;
}

export function LogMethod(level: 'info' | 'debug' = 'info') {
	return (target: any, key: string | symbol, propertyDescriptor?: PropertyDescriptor) => {
		const descriptor = propertyDescriptor || Object.getOwnPropertyDescriptor(target, key) || {};
		const originalMethod = descriptor.value;
		const classname = target.constructor.name;

		descriptor.value = function() {
			const args = Array.from(arguments).map( a => JSON.stringify(a)).join(',');
			const result = originalMethod.apply(this, arguments);
			const message = getMessage(target, key, args,result);

			logger(classname)[level](message);

			if (result instanceof Promise) {
				return result.then(r => {
					logger(classname)[level](message, 'resolved into:', r);

					return r;
				});
			}

			return result;
		};

		return descriptor;
	};
}
