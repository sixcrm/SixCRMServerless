'use strict';
require('../../../routes.js');
const DeploymentJob = global.routes.include('deployment', 'jobs/deployment-job.js');
const dynamodeploymentutilities = global.routes.include('deployment', 'utilities/dynamo-deploy-tables');

class DeployDynamoTablesJob extends DeploymentJob {

    constructor() {
        super('DeployDynamoTablesJob');
    }

    execute(environment) {
        super.execute(environment);
        return dynamodeploymentutilities.deployAll(environment);
    }
}

module.exports = DeployDynamoTablesJob;