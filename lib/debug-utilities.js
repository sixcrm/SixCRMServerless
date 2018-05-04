const  _ =  require('lodash');
const util = require('util');
const chalk = require('chalk');
const moment = require('moment');

module.exports = class DebugUtilities {

	static immutable() { this.echo(arguments, 'immutable'); }
	static debug() { this.echo(arguments, 'debug'); }
	static critical() { this.echo(arguments, 'critical'); }
	static deep() { this.echo(arguments, 'deep'); }
	static warning() { this.echo(arguments, 'warning'); }
	static highlight() { this.echo(arguments, 'highlight'); }
	static output() { this.echo(arguments, 'output'); }
	static error() { this.echo(arguments, 'error'); }
	static info() { this.echo(arguments, 'info'); }

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

		if(_.has(process.env, 'SIX_DEBUG_LOCAL')){
			return true;
		}

		if(_.has(process.env, 'CIRCLECI') && process.env.CIRCLECI == true){
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
			immutable: 0,
			debug: 2,
			critical: 1,
			deep: 3,
			warning: 2,
			highlight: 2,
			output: 1,
			error: 2,
			info: 2
		};

		return _.has(process.env, 'SIX_VERBOSE') && process.env.SIX_VERBOSE >= sixVerbosityLevels[level];

	}

	static echoLocal(argumentation, level) {

		let args = Array.from(argumentation);
		let output = [];

		args.forEach((a_argument) => {

			let critical_string = '********************';

			if (level === 'critical') {
				output.push(critical_string)
				output.push('\n');
			}

			if(_.isString(a_argument)) {
				output.push(a_argument);
			}
			else if(_.isObject(a_argument)) {
				output.push(util.inspect(a_argument, {depth : null}));
			}
			else {
				output.push(a_argument);
			}

			if (level === 'critical') {
				output.push('\n');
				output.push(critical_string)
			}

		});

		output = output.join('\n');

		output = this.formatForConsole(output, level);
		// eslint-disable-next-line no-console
		console.log(output);

	}

	static formatForConsole(output, level) {

		const formatters = {
			immutable: chalk.green,
			debug: chalk.grey,
			critical: chalk.grey,
			deep: chalk.grey,
			warning: chalk.bold.bgRed,
			highlight: chalk.underline.green,
			output: chalk.green,
			error: chalk.black.bgYellow,
			info: chalk.blue
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
