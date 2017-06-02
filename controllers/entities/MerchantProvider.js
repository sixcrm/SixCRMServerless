'use strict';
var entityController = global.routes.include('controllers', 'entities/Entity.js');

class merchantProviderController extends entityController {

    constructor(){
        super('merchantprovider');
    }

}

module.exports = new merchantProviderController();
