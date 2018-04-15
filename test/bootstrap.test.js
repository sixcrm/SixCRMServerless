const jwt  = require('jsonwebtoken');

before(function(done) {

	global.test_account = 'd3fa3bf3-7824-49f4-8261-87674482bf1c';

	global.transaction_jwt = jwt.sign({user_id:'93b086b8-6343-4271-87d6-b2a00149f070'}, global.SixCRM.configuration.site_config.jwt.site.secret_key);

	done();

	//do some fixture loading etc here
});

after(function(done) {
	done();
	// here you can clear fixtures, etc.
});
