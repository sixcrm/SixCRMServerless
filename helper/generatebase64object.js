'use strict'
require('../routes.js');
const encode = global.routes.include('lib', 'encode');
const du = global.routes.include('lib','debug-utilities.js');

process.env.SIX_VERBOSE = 2;
let object = {
    class: "tracker",
    method:"view",
    tracker:{
        id:"62949662-edd6-4750-9280-2d40c225eb80"
    }
};
let encoded_string = encode.objectToBase64(object)
let decoded_object = encode.base64ToObject(encoded_string);

du.output(
  'Object: ', object,
  'Encoded String: '+encoded_string,
  'Decoded Object: ', decoded_object
);
