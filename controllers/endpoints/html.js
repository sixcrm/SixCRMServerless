'use strict';
const _ = require("underscore");

const du = global.routes.include('lib', 'debug-utilities.js');

var trackerController = global.routes.include('controllers', 'entities/Tracker.js');
var publicController = global.routes.include('controllers', 'endpoints/public.js');

class htmlController extends publicController{

    constructor(){

        super();

    }

    execute(event){

        return this.Promise.resolve('Hello');

    }

}

module.exports = new htmlController();
