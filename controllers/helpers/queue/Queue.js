'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const sqs = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

class Queue {

  static listMessages(queueName) {

    du.debug('Listing Messages');

    return sqs.receiveMessages({queue: queueName, limit: 10, visibilityTimeout: 0})
    .then((messages) => {

      if (_.isUndefined(messages) || _.isNull(messages) || !arrayutilities.nonEmpty(messages)) {
        return [];
      }

      return arrayutilities.map(messages, (message) => {
        return {id: message.MessageId, queue: queueName, message: message.Body};
      });

    });

  }

}

module.exports = Queue;
