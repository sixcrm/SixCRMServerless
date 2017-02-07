'use strict'
var _ =  require('underscore');
var chai = require('chai');
chai.use(require('chai-json-schema'));
var assert = require('chai').assert;
var fs = require('fs');

class TestUtilities {
	
	constructor(){
	
	}
	
	assertResultSet(response){
		console.log(response.body);
		assert.isObject(response.body.data);
	}

	getQuery(filepath){
		var query = fs.readFileSync(filepath, 'utf8');
		query = query.replace(/[\r\n\t]/g,' ').replace(/\s+/g,' ');
		query = JSON.parse(query).body.trim();
		return query;
	}
	
}

var tu =  new TestUtilities;
module.exports = tu;