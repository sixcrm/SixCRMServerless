'use strict';
require('../../../routes.js');
const DeploymentJob = global.routes.include('deployment', 'jobs/deployment-job.js');
const dynamodeploymentutilities = global.routes.include('deployment', 'utilities/dynamo-deploy-tables');

class PurgeDynamoTablesJob extends DeploymentJob {

    constructor() {
        super('PurgeDynamoTablesJob');
    }

    execute(environment) {
        super.execute(environment);
        return dynamodeploymentutilities.deleteAll(environment);
    }
}

module.exports = PurgeDynamoTablesJob;