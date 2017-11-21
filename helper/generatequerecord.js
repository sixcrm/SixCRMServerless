'use strict'
const uuidV4 = require('uuid/v4');

require('../SixCRM.js');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const random = global.SixCRM.routes.include('lib','random.js');
const timestamp = global.SixCRM.routes.include('lib','timestamp.js');

setEnvironmentVariables();

const kinesisfirehoseutilities = require('../lib/kinesis-firehose-utilities');

function createRandomKinesisQueueRecord(){

    let spoofed_record = {
        queuename : random.selectRandomFromArray(["bill", "hold", "pending", "shipped", "delivered", "recover", "failed"]),
        account: uuidV4(),
        count:    random.randomInt(1, 2000),
        datetime: timestamp.getISO8601()
    };

    du.debug('Spoofed Record:', spoofed_record);

    return spoofed_record;

}

function setEnvironmentVariables(){

    process.env.SIX_VERBOSE = 2;
    process.env.aws_region = 'us-east-1';

}

return kinesisfirehoseutilities.putRecord('queues', createRandomKinesisQueueRecord()).then((result) => {
    du.output('Kinesis Firehose Result', result);
    return result;
})
.catch((error) => {
    du.warning('Error:', error);
});
