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

		global.transaction_jwt = jwt.sign({user_id:'93b086b8-6343-4271-87d6-b2a00149f070'}, global.site_config.jwt.transaction_key);
		
		global.site_jwt = jwt.sign({user_id:'93b086b8-6343-4271-87d6-b2a00149f070'}, global.site_config.jwt.site_key);
				
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
