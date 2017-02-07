'use strict';
var AWS = require("aws-sdk");
var _ = require("underscore");

var lr = require('../../lib/lambda-response.js');
var rebillController = require('../../controllers/Rebill.js');
var lr = require('../../lib/lambda-response.js');

module.exports.confirmshipped = (event, context, callback) => {
    
    var rebill_id = event.id;
    
    rebillController.get(rebill_id).then((rebill) => {
    	
    	if(_.has(rebill, "trackingnumber")){
    		
    		return callback(null, rebill);
    		
    	}else{
    		
    		return callback(null, false);
    		
    	}	
    	
    });        

}