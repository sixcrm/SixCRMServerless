const jwt = require('jsonwebtoken');
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require("underscore");

before(function(done) {
	
	try {
	  var config = yaml.safeLoad(fs.readFileSync('./config/'+global.environment+'/site.yml', 'utf8'));
	  global.site_config = config;
	} catch (e) {
	  console.log(e);
	}
	
	try{
		var created_token = jwt.sign({}, global.site_config.site_secret_jwt_key);
		global.test_jwt = created_token;
	} catch (e){
		console.log(e);
	}

	done();
  //do some fixture loading etc here	
});

after(function(done) {
	done();
  // here you can clear fixtures, etc.
});
