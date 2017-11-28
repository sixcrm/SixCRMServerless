'use strict'
const _ = require('underscore');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const ResponseController = global.SixCRM.routes.include('providers', 'Response.js');

module.exports = class ShippingProviderResponse extends ResponseController {

  constructor({shortname, parameters, result}){

    super();

    this.parameter_validation = {
      'constructorarguments':global.SixCRM.routes.path('model', 'vendors/shippingproviders/response/constructor.json'),
      'shortname':global.SixCRM.routes.path('model', 'vendors/shippingproviders/response/shortname.json'),
      'parameters':global.SixCRM.routes.path('model', 'vendors/shippingproviders/response/parameters.json'),
      'status':global.SixCRM.routes.path('model', 'vendors/shippingproviders/response/status.json'),
      'delivered':global.SixCRM.routes.path('model', 'vendors/shippingproviders/response/delivered.json'),
      'detail':global.SixCRM.routes.path('model', 'vendors/shippingproviders/response/detail.json'),
      'result':global.SixCRM.routes.path('model', 'vendors/shippingproviders/response/result.json'),
    }

    this.initialize();

    this.parameters.set('constructorarguments', arguments[0]);

    this.setConstructorParameters();

    this.setResponse(result);

  }

  setConstructorParameters(){

    du.debug('Set Constructor Parameters');

    let constructor_arguments = this.parameters.get('constructorarguments');

    objectutilities.map(constructor_arguments, (constructor_argument) => {
      this.parameters.set(constructor_argument, constructor_arguments[constructor_argument]);
    });

    this.setResponseParameters()

  }

  setResponseParameters(){

    du.debug('Set Response Parameters');

    let parameters = this.parameters.get('parameters');

    objectutilities.map(parameters, (parameter) => {
      this.parameters.set(parameter, parameters[parameter]);
    });

  }

  getDetail(){

    return this.parameters.get('detail');

  }

  getDelivered(){

    return this.parameters.get('delivered');

  }

  getStatus(){

    return this.parameters.get('status');

  }

}
