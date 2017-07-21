'use strict';
require('../../routes.js');

const du = global.routes.include('lib', 'debug-utilities.js');

class DeploymentJob {

    constructor(name) {
        this.name = name;
    }

    execute(environment) {
        du.highlight('Executing ' + this.name + ' on ' + environment + '.');
    }
}

module.exports = DeploymentJob;