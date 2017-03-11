'use strict';
let crypto = require('crypto');

class Signature {
	
	static createSignature(secret, signing_string){
	
		let pre_hash = secret+signing_string;
		return crypto.createHash('sha1').update(pre_hash).digest('hex');	
	
	}
	
	static validateSignature(secret, signing_string, signature){
		
		let correct_signature = this.createSignature(secret, signing_string);
		return (signature === correct_signature);
		
	}
	
}

module.exports = Signature;