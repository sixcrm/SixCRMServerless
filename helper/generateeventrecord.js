'use strict'
const uuidV4 = require('uuid/v4');

require('../routes.js');

const du = global.routes.include('lib','debug-utilities.js');
const random = global.routes.include('lib','random.js');
const timestamp = global.routes.include('lib','timestamp.js');

setEnvironmentVariables();

const kinesisfirehoseutilities = require('../lib/kinesis-firehose-utilities');

function createRandomKinesisEventRecord(){

    let spoofed_record = {
        session: uuidV4(),
        type : random.selectRandomFromArray(['click', 'lead', 'order','upsell','confirm']),
        datetime: timestamp.getISO8601(),
        account: uuidV4(),
        campaign: uuidV4(),
        product_schedule: uuidV4(),
        affiliate: uuidV4(),
        subaffiliate_1: uuidV4(),
        subaffiliate_2: uuidV4(),
        subaffiliate_3: uuidV4(),
        subaffiliate_4: uuidV4(),
        subaffiliate_5: uuidV4()
    };

    du.debug('Spoofed Record:', spoofed_record);

    return spoofed_record;

}

function setEnvironmentVariables(){

    process.env.SIX_VERBOSE = 2;
    process.env.kinesis_firehose_events_stream = 'sixcrm-firehose-events';
    process.env.aws_region = 'us-east-1';

}

return kinesisfirehoseutilities.putRecord('events', createRandomKinesisEventRecord()).then((result) => {
    du.output('Kinesis Firehose Result', result);
    return result;
})
.catch((error) => {
    du.warning('Error:', error);
});
