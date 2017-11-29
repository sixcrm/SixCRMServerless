'use strict';
require('../../../SixCRM.js');
const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
const forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');
const forwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.billtohold = (event, context, callback) => {

  const params = {
    name: 'billtohold',
    origin_queue: 'bill',
    destination_queue: 'hold',
    failure_queue: 'bill_failed',
    workerfunction: 'processBilling.js',
    error_queue: 'some_queue'
  };

  return ExecuteForwardRebillMessageController(params, event, callback);

};

module.exports.recovertohold = (event, context, callback) => {

  const params = {
      name: 'recovertohold',
      origin_queue: 'recover',
      destination_queue: 'hold',
      workerfunction: 'processBilling.js',
  };

  return ExecuteForwardRebillMessageController(params, event, callback);

};

module.exports.holdtopending = (event, context, callback) => {

  const params = {
    name: 'holdtopending',
    origin_queue: 'hold',
    destination_queue: 'pending',
    failure_queue: 'pending_failed',
    workerfunction: 'shipProduct.js'
  };

  return ExecuteForwardRebillMessageController(params, event, callback);

};

module.exports.pendingfailedtopending = (event, context, callback) => {

  const params = {
    name: 'pendingfailedtopending',
    workerfunction: 'shipProduct.js',
    origin_queue: 'pending_failed',
    destination_queue: 'pending'
  };

  return ExecuteForwardRebillMessageController(params, event, callback);

};

module.exports.pendingtoshipped = (event, context, callback) => {

  const params = {
    name: 'pendingtoshipped',
    workerfunction: 'confirmShipped.js',
    origin_queue: 'pending',
    destination_queue: 'shipped'
  };

  return ExecuteForwardRebillMessageController(params, event, callback);

};

module.exports.shippedtodelivered = (event, context, callback) => {

  const params = {
    name: 'shippedtodelivered',
    workerfunction: 'confirmDelivered.js',
    origin_queue: 'shipped',
    destination_queue: 'delivered'
  };

  return ExecuteForwardRebillMessageController(params, event, callback);

};

module.exports.deliveredtoarchive = (event, context, callback) => {

  const params = {
    name: 'deliveredtoarchive',
    workerfunction: 'archive.js',
    origin_queue: 'delivered'
  };

  return ExecuteForwardRebillMessageController(params, event, callback);

};

module.exports.holdtoarchive = (event, context, callback) => {

  const params = {
    name: 'holdtoarchive',
    workerfunction: 'archive.js',
    origin_queue: 'hold'
  };

  return ExecuteForwardRebillMessageController(params, event, callback);

};

module.exports.rebilltoarchive = (event, context, callback) => {

  const params = {
    name: 'rebilltoarchive',
    workerfunction: 'archive.js',
    origin_queue: 'rebill'
  };

  return ExecuteForwardRebillMessageController(params, event, callback);

};

module.exports.recovertoarchive = (event, context, callback) => {

  const params = {
    name: 'recovertoarchive',
    workerfunction: 'archive.js',
    origin_queue: 'recover'
  };

  return ExecuteForwardRebillMessageController(params, event, callback);

};

module.exports.indextoarchive = (event, context, callback) => {

  const params = {
    name: 'indextoarchive',
    origin_queue: 'search_indexing',
    failure_queue: 'search_indexing_failed',
    workerfunction: 'indexEntities.js',
    error_queue: 'some_queue',
    bulk: true
  };

  return ExecuteForwardMessageController(params, event, callback);

};

module.exports.sendnotificationstoarchive = (event, context, callback) => {

  const params = {
      name: 'sendnotificationstoarchive',
      origin_queue: 'send_notification',
      workerfunction: 'sendNotifications.js'
  };

  return ExecuteForwardMessageController(params, event, callback);

};

function ExecuteForwardMessageController(params, event, callback) {
  return new forwardMessageController(params).execute().then(() => {

    new LambdaResponse().issueResponse(200, {}, callback);

  }).catch((error) =>{

    new LambdaResponse().issueError(error.message, event, callback);

  });
}

function ExecuteForwardRebillMessageController(params, event, callback) {
  return new forwardRebillMessageController(params).execute().then(() => {

    new LambdaResponse().issueResponse(200, {}, callback);

  }).catch((error) =>{

    new LambdaResponse().issueError(error.message, event, callback);

  });
}
