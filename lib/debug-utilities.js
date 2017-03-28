'use strict'
var _ =  require('underscore');
const util = require('util');
const chalk = require('chalk');

class DebugUtilities {
	
	constructor(){
	
	}
	
	debug(){
	
		if(_.has(process.env, 'SIX_VERBOSE') && process.env.SIX_VERBOSE > 1){
			
			let args = Array.from(arguments);
			let output = [];
			
			args.forEach((a_argument) => {
				
				if(_.isString(a_argument)){
					output.push(a_argument);
				}else if(_.isObject(a_argument)){
					output.push(util.inspect(a_argument, {depth : null}));
				}else{
					output.push(a_argument);
				}
				
			});

            // eslint-disable-next-line no-console
			console.log(chalk.grey(output.join("\n")));
			
		}
		
	}
	
	warning(){
	
		if(_.has(process.env, 'SIX_VERBOSE') && process.env.SIX_VERBOSE > 1){
			
			let args = Array.from(arguments);
			let output = [];
			
			args.forEach((a_argument) => {
				
				if(_.isString(a_argument)){
					output.push(a_argument);
				}else if(_.isObject(a_argument)){
					if(a_argument instanceof Buffer){
						output.push(a_argument.toString('utf-8'));
					}else{
						output.push(util.inspect(a_argument, {depth : null}));
					}
				}else{
					output.push(a_argument);
				}
				
			});

            // eslint-disable-next-line no-console
			console.log(chalk.bold.bgRed(output.join("\n")));
			
		}
		
	}
	
	highlight(){
	
		if(_.has(process.env, 'SIX_VERBOSE') && process.env.SIX_VERBOSE > 1){
			
			let args = Array.from(arguments);
			let output = [];
			
			args.forEach((a_argument) => {
				
				if(_.isString(a_argument)){
					output.push(a_argument);
				}else if(_.isObject(a_argument)){
					output.push(util.inspect(a_argument, {depth : null}));
				}else{
					output.push(a_argument);
				}
				
			});

            // eslint-disable-next-line no-console
			console.log(chalk.bold.bgRed(output.join("\n")));
			
		}
		
	}
	
	output(){
		
		if(_.has(process.env, 'SIX_VERBOSE') && (process.env.SIX_VERBOSE > 0 || process.env.SIX_VERBOSE == true)){
				
			let args = Array.from(arguments);
			let output = [];
			
			args.forEach((a_argument) => {
				
				//console.log('Function: '+__function+', Line: '+__line);
				
				if(_.isString(a_argument)){
					output.push(a_argument);
				}else if(_.isObject(a_argument)){
					output.push(util.inspect(a_argument, {depth : null}));
				}else{
					output.push(a_argument);
				}
				
			});

			// eslint-disable-next-line no-console
			console.log(chalk.green(output.join("\n")));
			
		}
		
	}
			
}

var du = new DebugUtilities();

/*
Object.defineProperty(global, '__stack', {
get: function() {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack) {
            return stack;
        };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__line', {
get: function() {
        return __stack[1].getLineNumber();
    }
});

Object.defineProperty(global, '__function', {
get: function() {
        return __stack[1].getFunctionName();
    }
});
*/

module.exports = du;