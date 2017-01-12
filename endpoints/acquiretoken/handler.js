'use strict';
const jwt = require('jsonwebtoken');
var AWS = require("aws-sdk");
const _ = require("underscore");
var lr = require('../../lib/lambda-response.js');

module.exports.acquiretoken = (event, context, callback) => {
	
	//this should be in some helper somewhere...
	var timestamp = new Date().getTime(); + (60 * 60);

	var payload = {
		body: JSON.stringify({}),
		iat: timestamp,
		exp: Math.floor(Date.now() / 1000) + (60 * 60)
	}
	
	var created_token = jwt.sign(payload, process.env.site_secret_jwt_key);
	
	lr.issueResponse(200, {
		message: 'Success',
		token: created_token
	}, callback);

}