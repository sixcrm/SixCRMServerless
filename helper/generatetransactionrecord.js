'use strict'

const du = require('../lib/debug-utilities.js');
const random = require('../lib/random.js');
const uuidV4 = require('uuid/v4');
const timestamp = require('../lib/timestamp.js');

setEnvironmentVariables();

const kinesisfirehoseutilities = require('../lib/kinesis-firehose-utilities');

function createRandomKinesisTransactionRecord(){

    let spoofed_record = {
        id: uuidV4(),
        datetime: timestamp.getISO8601(),
        customer: uuidV4(),
        creditcard: uuidV4(),
        merchant_processor: uuidV4(),
        campaign: uuidV4(),
        affiliate: uuidV4(),
        amount: random.randomDouble(1.00, 45.00, 2),
        processor_result: random.selectRandomFromArray(['success', 'decline', 'error']),
        account: uuidV4(),
        transaction_type: random.selectRandomFromArray(['new', 'rebill']),
        product_schedule: uuidV4(),
        subaffiliate_1: uuidV4(),
        subaffiliate_2: uuidV4(),
        subaffiliate_3: uuidV4(),
        subaffiliate_4: uuidV4(),
        subaffiliate_5: uuidV4(),
        subtype: random.selectRandomFromArray(['main', 'upsell']),
    };

    return spoofed_record;

}

function setEnvironmentVariables(){

    process.env.kinesis_firehose_streams = 'six-development-transactions';
    process.env.aws_region = 'us-east-1';

}

return kinesisfirehoseutilities.putRecord('six-development-transactions', createRandomKinesisTransactionRecord(), 'transactions').then((result) => {
    du.output('Kinesis Firehose Result', result);
    return result;
})
.catch((error) => {
    du.warning('Error:', error);
});
