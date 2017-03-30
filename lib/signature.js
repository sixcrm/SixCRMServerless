'use strict';
let crypto = require('crypto');
const du = require('./debug-utilities.js');

class Signature {
	
	static createSignature(secret, signing_string){
	
		du.debug('Create Signature');
		
		let pre_hash = secret+signing_string;
		let hash = crypto.createHash('sha1').update(pre_hash).digest('hex');
		return hash;	
	
	}
	
	static validateSignature(secret, signing_string, signature){
		
		du.debug('Validate Signature');
		
		let correct_signature = this.createSignature(secret, signing_string);
		
		du.debug('Correct Signature: ', correct_signature);
		du.debug('Submitted Signature: ', signature);
		
		return (signature === correct_signature);
		
	}
	
}

module.exports = Signature;