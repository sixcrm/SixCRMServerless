'use strict'
const uuidV4 = require('uuid/v4');

require('../SixCRM.js');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const random = global.SixCRM.routes.include('lib','random.js');
const timestamp = global.SixCRM.routes.include('lib','timestamp.js');

setEnvironmentVariables();

const kinesisfirehoseutilities = require('../lib/kinesis-firehose-utilities');

function createRandomKinesisProductSchedulesRecord(){

    let spoofed_record = {
        transactions_id: uuidV4(),
        product_schedule: uuidV4(),
        datetime: timestamp.getISO8601(),
        customer: uuidV4(),
        creditcard: uuidV4(),
        merchant_provider: uuidV4(),
        campaign: uuidV4(),
        affiliate: uuidV4(),
        amount: random.randomDouble(1.00, 45.00, 2),
        processor_result: random.selectRandomFromArray(['success', 'decline', 'error']),
        account: uuidV4(),
        transaction_type: random.selectRandomFromArray(['new', 'rebill']),
        subaffiliate_1: uuidV4(),
        subaffiliate_2: uuidV4(),
        subaffiliate_3: uuidV4(),
        subaffiliate_4: uuidV4(),
        subaffiliate_5: uuidV4(),
        subtype: random.selectRandomFromArray(['main', 'upsell']),
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
