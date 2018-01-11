'use strict'
const uuidV4 = require('uuid/v4');

require('../SixCRM.js');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const timestamp = global.SixCRM.routes.include('lib','timestamp.js');

setEnvironmentVariables();

const kinesisfirehoseutilities = require('../lib/kinesis-firehose-utilities');

function createRandomKinesisProductSchedulesRecord(){

    let spoofed_record = {
        transactions_id: uuidV4(),
        product_schedule: uuidV4(),
        datetime: timestamp.getISO8601()
    };

    du.debug('Spoofed Record:', spoofed_record);

    return spoofed_record;

}

function setEnvironmentVariables(){

    process.env.SIX_VERBOSE = 2;
    process.env.aws_region = 'us-east-1';

}

return kinesisfirehoseutilities.putRecord('product_schedules', createRandomKinesisProductSchedulesRecord()).then((result) => {
    du.output('Kinesis Firehose Result', result);
    return result;
})
.catch((error) => {
    du.warning('Error:', error);
});
