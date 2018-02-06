'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class loadBalancerAssociationController extends entityController {

  constructor(){

    super('loadbalancerassociation');

  }

}

module.exports = new loadBalancerAssociationController();
