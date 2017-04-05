"use strict"
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('underscore');
const du = require('../../lib/debug-utilities.js');
const sqsutilities = require('../../lib/sqs-utilities.js');

let environment = process.argv[2];
let environment_account_id = process.argv[3];
let region = process.argv[4];

try {
  var serverless_config = yaml.safeLoad(fs.readFileSync(__dirname+'/../../serverless.yml', 'utf8'));
} catch (e) {
  du.warning(e);
}

du.highlight('Executing SQS Purge');

let purge_promises = [];

du.debug('Serverless Config: ', serverless_config);

for(const resource in serverless_config.resources.Resources) {

	let resource_definition = serverless_config.resources.Resources[resource];
	
	if(_.has(resource_definition, 'Type') && resource_definition.Type == 'AWS::SQS::Queue'){
	
		if(_.has(resource_definition, 'Properties') && _.has(resource_definition.Properties, 'QueueName')){
			
			let queue_name = buildQueueName(resource_definition.Properties.QueueName);
			
			let queue_url = buildQueueUrl(queue_name);
			
			du.highlight('Purging Queue: '+queue_name);
			
			purge_promises.push(purgeQueue(queue_url));
			
		}
		
	}
	
}

Promise.all(purge_promises).then((purge_results) => {
	
	du.highlight('Queues Purged');
	//du.debug(purge_results);
		
}).catch((error) => {

	du.warning(error);
	
});

function purgeQueue(queue_url){
	
	du.debug('Purge Queue');
	
	return new Promise((resolve, reject) => {
		
		sqsutilities.purgeQueue({queue_url: queue_url}, (error, data) => {
			
			if(error){
				
				return reject(error);
				
			}else{
			
				return resolve(data);
				
			}
			
		});
		
	});
	
}

function buildQueueName(proto_queue_name){
	
	du.debug('Build Queue Name');
		
	return proto_queue_name.replace('${opt:stage}', environment);
			
}
 
function buildQueueUrl(queue_name){
	
	du.debug('Build Queue URL');
	
	return 'https://sqs.'+region+'.amazonaws.com/'+environment_account_id+'/'+queue_name;
	
}   
