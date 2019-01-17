
require('@6crm/sixcrmcore');
const encode = require('@6crm/sixcrmcore/util/encode').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

process.env.SIX_VERBOSE = 2;
let object = {
	class: "Tracker",
	method:"view",
	tracker:{
		id:"62949662-edd6-4750-9280-2d40c225eb80"
	}
};
let encoded_string = encode.objectToBase64(object)
let decoded_object = encode.base64ToObject(encoded_string);

du.info(
	'Object: ', object,
	'Encoded String: '+encoded_string,
	'Decoded Object: ', decoded_object
);
