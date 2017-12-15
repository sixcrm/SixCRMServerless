'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const ThreePLController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/ThreePL/handler.js');

class HashtagController extends ThreePLController {

  constructor({fulfillment_provider}){

    super(arguments[0]);

    this.ThreePLID = 773;
    this.ThreePLFacilityID = 2;

    this.parameter_validation = {};
    this.parameter_definition = {};

    this.augmentParameters();

  }

}

module.exports = new HashtagController();
