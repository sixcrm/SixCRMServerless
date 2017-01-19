'use strict'
var _ =  require('underscore');
var crypto = require('crypto');

class Signature {
	
	static createSignature(secret, request_time){
	
		var pre_hash = secret+request_time;
		return crypto.createHash('sha1').update(pre_hash).digest('hex');	
	
	}
	
}

module.exports = Signature;