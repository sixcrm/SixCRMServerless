'use strict'
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

class IntegrationTestGenerator extends workerController {

  constructor(){

    super();

  }

  execute(){

  }

}

module.exports = new IntegrationTestGenerator();
