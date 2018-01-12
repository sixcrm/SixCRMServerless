'use strict';
const _ = require("underscore");
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
const forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

module.exports = class forwardSessionMessageController extends forwardMessageController {

    constructor(){

      super();

    }

};
