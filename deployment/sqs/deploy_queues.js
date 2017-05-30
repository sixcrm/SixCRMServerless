'use strict';
require('../../routes.js');
const queuePrefix = 'https://sqs.us-east-1.amazonaws.com/068070110666/';
const maxReceiveCount = 5;

const _ = require('underscore');
const fs = require('fs');
const du = global.routes.include('lib', 'debug-utilities.js');

const sqsUtils = global.routes.include('lib', 'sqs-utilities.js');

// Technical Debt: This should go to a lib library or got from a dependency.
let delay = (time) => (result) => new Promise(resolve => setTimeout(() => resolve(result), time));
const seventySeconds = 70 * 1000;

const environment = process.argv[2];

du.highlight(`Executing SQS Deployment`);

getQueueDefinitions()
    .then(queueDefinitions => deleteQueues(queueDefinitions))
    .then((queueDefinitions) => {
        du.highlight('Waiting for delete to take effect.');

        return queueDefinitions;
    })
    .then(delay(seventySeconds))
    .then(queueDefinitions => createQueues(queueDefinitions))
    .then(() => {du.highlight('Complete')})
    .catch((error) => {
        throw new Error(error);
    });

function getQueueDefinitions() {
    const queueDir = `${__dirname}/queuedefinitions/`;
    const files = fs.readdirSync(queueDir);
    const queueObjects = files.map((file) => {
        du.debug(`Queue Definition File: ${file}`);
        const queueObj = require(`${queueDir}${file}`);

        return queueObj;
    });

    return Promise.resolve(queueObjects);
}

function deleteQueues(queueDefinitions) {

    queueDefinitions.map((queue) => {
        du.highlight('Deleting ' + queue.QueueName + '_deadletter');
        du.highlight('Deleting ' + queue.QueueName);
    });

    return Promise.resolve(queueDefinitions);
}

function createQueues(queueDefinitions) {
    queueDefinitions.map((definition) => {
        let queue = JSON.parse(JSON.stringify(definition));
        let deadletter_queue = JSON.parse(JSON.stringify(definition));

        deadletter_queue.QueueName = `${queue.QueueName}_deadletter`;

        let deadletter_queue_arn = `${queuePrefix}${environment}-${deadletter_queue.QueueName}`;

        queue.Attributes["RedrivePolicy"] = `{\"deadLetterTargetArn\":\"${deadletter_queue_arn}\",\"maxReceiveCount\":\"${maxReceiveCount}\"}`;

        du.highlight(deadletter_queue);
        du.highlight(queue);

    });

    return Promise.resolve(queueDefinitions);
}
