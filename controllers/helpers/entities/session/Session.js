'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

module.exports = class SessionHelper {

  constructor(){

  }

  isComplete({session}){

    du.debug('Is Complete');

    if(session.completed == true){
      return true;
    }

    return false;

  }

  isCurrent({session: session}){

    du.debug('Is Current');

    let session_length = global.SixCRM.configuration.site_config.jwt.transaction.expiration;

    let expired = session.created_at < timestamp.toISO8601(timestamp.createTimestampSeconds() - session_length);

    return !expired;

  }

};
