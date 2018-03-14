'use strict';

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

class PushRDSRecordsController {

  constructor(){

    this.queue_name = 'rds_transaction_batch';
    this.sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');

  }

  execute(){

    du.debug('Execute');

    return this.getRecordsFromSQS()
    .then(records => this.executeBatchWrite(records))
    .then(records => this.removeRecordsFromSQS(records));

  }

  getRecordsFromSQS(){

    du.debug('Get Records From SQS');

    return this.sqsutilities.receiveMessagesRecursive({
      queue: this.queue_name
    });

  }

  executeBatchWrite(records){

    du.debug('Execute Batch Write');

    if(arrayutilities.nonEmpty(records)){

      return this.createBatchWriteQuery(records)
      .then(batch_write_query => this.executeBatchWriteQuery(batch_write_query))
      .then(() => {
        return records;
      });

    }

    return Promise.resolve(records);

  }

  createBatchWriteQuery(records){

    du.debug('Create Batch Write Query');

    du.info(records);
    let batch_write_query = '';

    return Promise.resolve(batch_write_query);

  }

  executeBatchWriteQuery(batch_write_query){

    du.debug('Execute Batch Write Query');

    du.info(batch_write_query);

    return true;

  }

  removeRecordsFromSQS(records){

    du.debug('Remove Records From SQS');

    if(arrayutilities.nonEmpty(records)){

      return this.sqsutilities.deleteMessages({
        messages: records,
        queue: this.queue_name
      }).then(() => {
        return true;
      });

    }else{

      return Promise.resolve(true);

    }

  }

}

module.exports = new PushRDSRecordsController();
