'use strict'
const _ =  require('underscore');
const request = require('request');
const du = require('../lib/debug-utilities.js');

class SlackUtilities {
	
	constructor(){
		this.basepath = 'https://hooks.slack.com/services/';
		this.channels = {
			adminsixcrmdotcom: {
				path: 'T0HFP0FD5/B4F1KKKK5/kckMuyS88DifAqdHFljD1qCI',
				name: 'Admin Six CRM dot com'
			}
		};
	}
	
	sendMessage(message, channel){
		
		du.debug('Slack::sendMessage '+message+' being sent to channel '+channel);
		
		return new Promise((resolve, reject) => {	
			
			let endpoint = this.basepath;
			
			if(_.has(this.channels, channel)){
				
				endpoint += this.channels[channel].path;
				
			}else{
			
				return reject(new Error('Undefined channel: '+channel));
				
			}
				
			let endpoint = 'https://hooks.slack.com/services/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';
			
			du.debug(endpoint);
			
			request.post(
				endpoint,
				{ json: { "text": message } },
				function (error, response, body) {
					if (!error && response.statusCode == 200) {
						du.debug(body);
						return resolve(body);
					}else{
						du.debug(error);
						return reject(error);
					}
				}
			);
		});
		
	}
			
}

var su = new SlackUtilities();

module.exports = su;