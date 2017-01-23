'use strict';
const jwt = require('jsonwebtoken');
var AWS = require("aws-sdk");
const _ = require("underscore");

var lr = require('../../lib/lambda-response.js');
var timestamp = require('../../lib/timestamp.js');

module.exports.acquiretoken = (event, context, callback) => {
	
	console.log(event.requestContext.authorizer.user);
	
	var user_id = event.requestContext.authorizer.user;
	
	var _timestamp = timestamp.createTimestampSeconds() + (60 * 60);

	var payload = {
		iat: _timestamp,
		exp: _timestamp,
		user_id: user_id
	}
	
	var created_token = jwt.sign(payload, process.env.site_secret_jwt_key);
	
	lr.issueResponse(200, {
		message: 'Success',
		token: created_token
	}, callback);

}