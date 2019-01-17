import du from './debug-utilities';
import hu from './hash-utilities';

export default class Signature {

	static createSignature(secret, signing_string) {

		du.debug('Create Signature');

		const pre_hash = secret + signing_string;
		const hash = hu.toSHA1(pre_hash);

		return hash;

	}

	static validateSignature(secret, signing_string, signature) {

		du.debug('Validate Signature');

		const correct_signature = this.createSignature(secret, signing_string);

		du.debug('Correct Signature: ', correct_signature);
		du.debug('Submitted Signature: ', signature);

		return (signature === correct_signature);

	}

}
