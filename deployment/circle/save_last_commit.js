'use strict';
require('../../SixCRM.js');
const exec = require('child_process').execSync;
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

let last_commit = exec(`git rev-parse --verify HEAD`).toString().replace(/\r?\n|\r/g,'');
let bucket_name = 'sixcrm-' + global.SixCRM.configuration.stage + '-resources';

return s3utilities.assureBucket({Bucket: bucket_name})
    .then(() => {

        let parameters = {
            Bucket: bucket_name,
            Key: 'last_commit.txt',
            Body: last_commit
        };

        return s3utilities.putObject(parameters);

    })
    .then(() => {
        du.output('Successfully uploaded last commit (' + last_commit + ') to S3');
        process.exit();
    })
    .catch((error) => {
        du.error(error);
        process.exit();
    });
