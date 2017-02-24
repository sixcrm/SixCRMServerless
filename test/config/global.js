global.environment = 'local';

console.log("global.js executes ...");
if(typeof process.env.TEST_ENVIRONMENT !== 'undefined'){
	
	global.environment = process.env.TEST_ENVIRONMENT;
	
}
