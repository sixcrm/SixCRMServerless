'use strict';
var _ = require("underscore");

const cloudsearchutilities = global.routes.include('lib', 'cloudsearch-utilities.js');
const indexingutilities = global.routes.include('lib', 'indexing-utilities.js');
const du = global.routes.include('lib', 'debug-utilities.js');

var workerController = global.routes.include('controllers', 'workers/worker.js');

class indexEntitiesController extends workerController {

    constructor(){
        super();
        this.messages = {
            success:'SUCCESS',
            successnoaction:'SUCCESSNOACTION',
            failure:'FAIL'
        }
    }

    execute(event){

        du.debug('Executing Entity Index');

        return new Promise((resolve, reject) => {

            let processed_documents = indexingutilities.createIndexingDocument(event);

            du.debug('Documents ready for indexing.', processed_documents);

            cloudsearchutilities.uploadDocuments(processed_documents).then((response) => {

                du.debug('Cloudsearch indexing response: ', response);

                if(_.has(response, 'status') && response.status == 'success'){
                    return resolve(this.messages.success);
                }else{
                    return resolve(this.messages.successnoaction);
                }

            }).catch(() => {
                return reject(this.messages.failure);
            });

        });

    }

}

module.exports = new indexEntitiesController();
