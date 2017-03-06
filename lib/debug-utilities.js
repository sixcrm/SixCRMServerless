'use strict'
var _ =  require('underscore');
const util = require('util');

class DebugUtilities {
	
	constructor(){
	
	}
	
	output(something){
		
		if(_.has(process.env, 'SIX_VERBOSE') && process.env.SIX_VERBOSE == true){
				
			let args = Array.from(arguments);
			
			args.forEach((a_argument) => {
				
				//console.log('Function: '+__function+', Line: '+__line);
				
				if(_.isString(a_argument)){
					console.log(a_argument);
				}else if(_.isObject(a_argument)){
					console.log(util.inspect(a_argument, {depth : null}));
				}else{
					console.log(a_argument);
				}
				
			});
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