'use strict';
let du = global.SixCRM.routes.include('lib', 'debug-utilities');
var publicController = global.SixCRM.routes.include('controllers', 'endpoints/public.js');

class publicHTMLController extends publicController{

    constructor(){

        super();

    }

    execute(event){

      return this.preprocessing(event)
      .then(() => this.routeRequest());

    }

}

module.exports = new publicHTMLController();
