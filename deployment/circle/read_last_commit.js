'use strict';
require('../../SixCRM.js');
const s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

let bucket_name = 'sixcrm-' + global.SixCRM.configuration.stage + '-resources';

return s3utilities.getObject(bucket_name, 'last_commit.txt')
    .then((data) => {
        let last_commit = data.Body.toString();

        process.stdout.write(last_commit);
        process.exit();
    })
    .catch(() => {
        process.exit();
    });
