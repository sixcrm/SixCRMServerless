'use strict';
var _ = require("underscore");

const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');
const indexingutilities = global.SixCRM.routes.include('lib', 'indexing-utilities.js');
const sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');
const lambdautilities = global.SixCRM.routes.include('lib', 'lambda-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

var workerController = global.SixCRM.routes.include('controllers', 'workers/worker.js');

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

        return this.getMessages().then((messages) => {

            return new Promise((resolve, reject) => {

                let processed_documents = indexingutilities.createIndexingDocument(messages);

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

        });

    }

    getMessages() {
        du.debug('Get Messages');

        return sqsutilities.receiveMessages({queue: process.env.search_indexing_queue, limit: 10}).then((messages) => {

            du.debug('Got Messages' + messages);

            if (messages && messages.length > 0) {

                du.debug('There are ' + messages.length + 'messages.');

                // If there are 10 messages (maximum), invoke the lambda again so it picks the rest of the messages.
                if (messages.length === 10) {
                    lambdautilities.invokeFunction({
                        function_name: lambdautilities.buildLambdaName('indexentities'),
                        payload: JSON.stringify({}),
                        invocation_type: 'Event'
                    }); // 'Event' type will make the lambda execute asynchronously.
                }

                return messages;
            } else {
                return [];
            }
        });
    }

}

module.exports = new indexEntitiesController();
