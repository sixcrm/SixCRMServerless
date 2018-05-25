const  _ =  require('lodash');
const util = require('util');
const chalk = require('chalk');
const moment = require('moment');

module.exports = class DebugUtilities {

	static debug() { this.echo(arguments, 'debug'); }
	static info() { this.echo(arguments, 'info'); }
	static warning() { this.echo(arguments, 'warning'); }
	static error() { this.echo(arguments, 'error'); }
	static fatal() { this.echo(arguments, 'fatal'); }

	static echo(argumentation, level) {

		if (!this.emit(level)) {
			return;
		}

		if (this.isLocal()) {
			return this.echoLocal(argumentation, level);
		}
		else {
			return this.echoCloudwatch(argumentation, level);
		}

	}

	static isLocal() {

		this.echoLocal(process.env, 'info');
		if(_.has(process.env, 'SIX_DEBUG_LOCAL')){
			return true;
		}

		if(_.has(process.env, 'CIRCLECI')){
			return true;
		}

		if (!global.SixCRM || !global.SixCRM.configuration) {
			return false;
		}

		let stages = global.SixCRM.routes.include('config', 'stages.yml');

		if(!_.has(stages, global.SixCRM.configuration.stage)) {
			return false;
		}

		return !_.has(stages[global.SixCRM.configuration.stage], 'aws_account_id');

	}

	static emit(level) {

		const sixVerbosityLevels = {
			debug: 3,
			info: 2,
			warning: 1,
			error: 0,
			fatal: -1
		};

		return _.has(process.env, 'SIX_VERBOSE') && process.env.SIX_VERBOSE >= sixVerbosityLevels[level];

	}

	static echoLocal(argumentation, level) {

		let args = Array.from(argumentation);
		let output = [];

		args.forEach((a_argument) => {

			if(_.isString(a_argument)) {
				output.push(a_argument);
			}
			else if(_.isObject(a_argument)) {
				output.push(util.inspect(a_argument, {depth : null}));
			}
			else {
				output.push(a_argument);
			}

		});

		output = output.join('\n');

		output = this.formatForConsole(output, level);
		// eslint-disable-next-line no-console
		console.log(output);

	}

	static formatForConsole(output, level) {

		const formatters = {
			debug: chalk.grey,
			info: chalk.cyan,
			warning: chalk.yellow,
			error: chalk.bold.red,
			fatal: chalk.bold.white.bgRed
		};

		return formatters[level](output);

	}

	static echoCloudwatch(argumentation, level) {

		let message = "";
		let context = {};
		let error_code = undefined;
		let stack = undefined;

		if (_.isString(argumentation[0])) {
			message = argumentation[0];
			context = Array.prototype.slice.call(argumentation, 1);
		}
		else {
			context = argumentation;
		}

		if (_.isError(context[0])) {
			error_code = context[0].code;
			stack = context[0].stack;

			if (!message && context[0].message) {
				message = context[0].message;
			}
		}

		//eslint-disable-next-line no-console
		console.log(JSON.stringify({
			timestamp: moment().toISOString(),
			message,
			context,
			level,
			error_code,
			stack,
			//class,
			//method
		}));

	}

}
