'use strict';
require('../../SixCRM.js');
const S3Provider = global.SixCRM.routes.include('lib', 'providers/s3-provider.js');
const s3provider = new S3Provider();

let bucket_name = 'sixcrm-' + global.SixCRM.configuration.stage + '-resources';

return s3provider.getObject(bucket_name, 'last_commit.txt')
    .then((data) => {
        let last_commit = data.Body.toString();

        process.stdout.write(last_commit);
        return process.exit();
    })
    .catch(() => {
        process.exit();
    });
