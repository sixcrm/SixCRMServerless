'use strict';
require('../../routes.js');
const queueUrlPrefix = 'https://sqs.us-east-1.amazonaws.com/068070110666/';
const queueArnPrefix = 'arn:aws:sqs:us-east-1:068070110666:';
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
    .then(queueDefinitions => createDeadletterQueues(queueDefinitions))
    .then(queueDefinitions => createQueues(queueDefinitions))
    .then(() => {du.highlight('Complete')})
    .catch((error) => {
        du.error(error);
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

    let deleteOperations = [];

    queueDefinitions.map((queue) => {
        let queueUrl = getUrl(queue.QueueName);
        let deadletterQueueUrl = getUrl(queue.QueueName + '_deadletter');

        deleteOperations.push(sqsUtils.deleteQueue(deadletterQueueUrl));
        deleteOperations.push(sqsUtils.deleteQueue(queueUrl));
    });

    return Promise.all(deleteOperations).then(() => {
        return Promise.resolve(queueDefinitions);
    });
}

function createDeadletterQueues(queueDefinitions) {
    let createOperations = [];

    queueDefinitions.map((definition) => {
        let deadletter_queue = createDeadletterQueueDefinition(definition);

        addEnvironmentToName(deadletter_queue);

        createOperations.push(sqsUtils.createQueue(deadletter_queue));
    });

    return Promise.all(createOperations).then(() => {
        return Promise.resolve(queueDefinitions);
    });
}

function createQueues(queueDefinitions) {
    let createOperations = [];

    queueDefinitions.map((definition) => {
        let deadletter_queue = createDeadletterQueueDefinition(definition);
        let queue = JSON.parse(JSON.stringify(definition));

        configureDeadletterQueue(queue, deadletter_queue);

        addEnvironmentToName(queue);

        createOperations.push(sqsUtils.createQueue(queue));
    });

    return Promise.all(createOperations).then(() => {
        return Promise.resolve(queueDefinitions);
    });
}

function addEnvironmentToName(queue) {
    queue.QueueName = `${environment}-${queue.QueueName}`;
}

function createDeadletterQueueDefinition(queue) {
    let deadletter_queue = JSON.parse(JSON.stringify(queue));

    deadletter_queue.QueueName = `${queue.QueueName}_deadletter`;

    return deadletter_queue;
}

function configureDeadletterQueue(queue, deadletter_queue) {
    let deadletter_queue_arn = getArn(deadletter_queue.QueueName);

    queue.Attributes["RedrivePolicy"] = `{\"deadLetterTargetArn\":\"${deadletter_queue_arn}\",\"maxReceiveCount\":\"${maxReceiveCount}\"}`;
}

function getUrl(queueName) {
    return `${queueUrlPrefix}${environment}-${queueName}`;
}

function getArn(queueName) {
    return `${queueArnPrefix}${environment}-${queueName}`;
}