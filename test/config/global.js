global.environment = 'development';

if(typeof process.env.TEST_ENVIRONMENT !== 'undefined'){
		
	global.environment = process.env.TEST_ENVIRONMENT;
	
}

