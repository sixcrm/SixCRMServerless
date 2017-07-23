'use strict';
require('../../SixCRM.js');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

class DeploymentJob {

    constructor(name) {
        this.name = name;
    }

    execute(environment) {
        du.highlight('Executing ' + this.name + ' on ' + environment + '.');
    }
}

module.exports = DeploymentJob;