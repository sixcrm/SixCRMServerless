"use strict"
const AWS = require("aws-sdk");
const _ = require('underscore');
const Promise = require ('bluebird');
const fs = require('fs');
const yaml = require('js-yaml');

const du = require('../../lib/debug-utilities.js');

let cs = new AWS.CloudSearch({
	region: 'us-east-1',
	apiVersion: '2013-01-01'
});

let environment = process.argv[2];
let domain_name = 'sixcrm-'+environment;

du.highlight('Executing CloudSearch Deployment: '+domain_name);

createDomain()
	.then(createIndexes)
	.then(indexDocuments)
	.then(() => {
		du.highlight('Complete');
	}).catch((error) => {
		throw new Error(error); //This is what shows the unhandled error
	});


function createDomain(){

	du.debug('Create Domain');

	return new Promise((resolve, reject) => {

		let params = {
			DomainName: domain_name
		};

		cs.createDomain(params, (error, data) => {

			if(error){ return reject(error); }

			return resolve(data);

		});

	});

}

function createIndexes(){

	du.debug('Create Indexes');

	return new Promise((resolve, reject) => {

		getIndexObjects().then(index_objects => {

			let promises = [];

      //Limt the concurrency rate of promises to 1 to naively avoid rate limits
      Promise.map(index_objects, (indexObject) => {
        indexObject.DomainName = domain_name;
        return createIndex(indexObject);
      }, {concurrency: 1})
      .then((promises) => {
        return resolve(promises);
				du.debug('Resolved Promises: ', promises);
      })

			//for(var i = 0; i < index_objects.length; i++){

				//index_objects[i]['DomainName'] = domain_name;

				//let create_index_promise = createIndex(index_objects[i]);

				//promises.push(create_index_promise);

			//}

			//Promise.all(promises).then((promises) => {


				//return resolve(promises);

			//}).catch((error) => {

				//return reject(error);

			//});

		});

	});

}

function getIndexObjects(){

	return new Promise((resolve, reject) => {

		let response_objects = [];

		let index_directory = __dirname+'/indexes/';

		fs.readdir(index_directory, (error, files) => {

			if(error){ return reject(error); }

			files.forEach(file => {

				du.debug('Index File: '+file);

				let file_contents = fs.readFileSync(index_directory+file, 'utf8');

				let obj = JSON.parse(file_contents);

				response_objects.push(obj);

			});

			return resolve(response_objects);

		});

	});

}

function createIndex(index_object){

	return new Promise((resolve, reject) => {

		if(!_.has(index_object, 'IndexField')){

			du.warning(index_object);
			return reject('Index Object lacks IndexField');

		}

		if(!_.has(index_object.IndexField, 'IndexFieldName')){

			du.warning(index_object);
			return reject('Index Object lacks IndexField.IndexFieldName');

		}

		cs.defineIndexField(index_object, (error, data) => {

			if(error){ return reject(error); }

			return resolve(data);

		});

	});

}

function indexDocuments(){

	return new Promise((resolve, reject) => {

		var params = {
			DomainName: domain_name
		};

		cs.indexDocuments(params, (error, data) => {

			if(error){ return reject(error); }

			return resolve(data);

		});

	});

}
