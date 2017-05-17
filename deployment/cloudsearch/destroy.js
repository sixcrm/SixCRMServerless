"use strict"
require('../../routes.js');
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities.js');

//Technical Debt:  This should use a lib here instead of making raw AWS calls
let cs = new AWS.CloudSearch({
    region: 'us-east-1',
    apiVersion: '2013-01-01'
});
let environment = process.argv[2];
let domain_name = 'sixcrm-'+environment;

du.highlight('Executing CloudSearch Deletion: '+domain_name);

getDomainNames()
.then(deleteDomain)
.then(du.highlight('Complete'))
.catch((error) => {
    throw new Error(error);
});

function deleteDomain(domain_array){

    du.debug(domain_array);
    du.debug('Delete Domain');

    return new Promise((resolve, reject) => {

        if(_.contains(domain_array, domain_name)){

            let params = {
                DomainName: domain_name
            };

            cs.deleteDomain(params, (error, data) => {

                if(error){ return reject(error); }

                return resolve(data);

            });

        }else{

            du.debug('Domain name doesn\'t exist in this region.');

            return resolve(true);

        }

    });

}

function getDomainNames(){

    du.debug('Get Domain Names');

    return new Promise((resolve, reject) => {

        cs.listDomainNames((error, data) => {

            if(error){ return reject(error); }

            return resolve(Object.keys(data.DomainNames || {}));

        });

    });

}
