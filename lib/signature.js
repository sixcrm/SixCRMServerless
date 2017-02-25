'use strict';
let crypto = require('crypto');

class Signature {
	
	static createSignature(secret, request_time){
	
		let pre_hash = secret+request_time;
		return crypto.createHash('sha1').update(pre_hash).digest('hex');	
	
	}
	
	static validateSignature(secret, request_time, signature){
		
		let correct_signature = this.createSignature(secret, request_time);
		
		return (signature === correct_signature);
		
	}
	
}

module.exports = Signature;