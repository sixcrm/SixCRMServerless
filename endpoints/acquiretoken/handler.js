'use strict';
const jwt = require('jsonwebtoken');
var AWS = require("aws-sdk");
const _ = require("underscore");
var lr = require('../../lib/lambda-response.js');
var timestamp = require('../../lib/timestamp.js');

module.exports.acquiretoken = (event, context, callback) => {
	
	var timestamp = timestamp.createTimestampSeconds + (60 * 60);

	var payload = {
		body: JSON.stringify({}),
		iat: timestamp,
		exp: timestamp
	}
	
	var created_token = jwt.sign(payload, process.env.site_secret_jwt_key);
	
	lr.issueResponse(200, {
		message: 'Success',
		token: created_token
	}, callback);

}