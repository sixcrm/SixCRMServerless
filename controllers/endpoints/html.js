'use strict';
let du = global.routes.include('lib', 'debug-utilities');
var publicController = global.routes.include('controllers', 'endpoints/public.js');

class htmlController extends publicController{

    constructor(){

        super();

    }

    execute(event){

        return this.preprocessing(event)
      .then(() => this.routeRequest());
      /*
      .then(() => this.executeAction);
      */

    }

}

module.exports = new htmlController();
