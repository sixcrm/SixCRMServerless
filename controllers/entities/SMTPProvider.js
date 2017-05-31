'use strict';
var entityController = global.routes.include('controllers', 'entities/Entity.js');

class SMTPProviderController extends entityController {

    constructor(){

        super('smtpprovider');

    }

}

module.exports = new SMTPProviderController();
