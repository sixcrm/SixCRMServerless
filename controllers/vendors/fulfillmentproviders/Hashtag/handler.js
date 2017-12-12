'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const ThreePLController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/ThreePL/handler.js');

class HashtagController extends ThreePLController {

  constructor({fulfillment_provider}){

    super(arguments[0]);

  }

}

module.exports = new HashtagController();
