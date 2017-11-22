'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const sqs = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

class Queue {

  listMessages(queueName) {

    du.debug('Listing messages for queue,', queueName);

    return new Promise((resolve, reject) => {
      sqs.receiveMessages({queue: queueName, limit: 10, visibilityTimeout: 0})
        .then(messages => {
          if (!messages || messages.length === 0) {
            return resolve([]);
          }

          const parsedMessages = messages.map(message => {
            return {id: message.MessageId, queue: queueName, message: message.Body}
          });

          return resolve(parsedMessages)
        })
        .catch(err => reject(err))
    });

  }

}

module.exports = new Queue();