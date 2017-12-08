'use strict'
const uuidV4 = require('uuid/v4');

require('../SixCRM.js');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const random = global.SixCRM.routes.include('lib','random.js');
const timestamp = global.SixCRM.routes.include('lib','timestamp.js');

setEnvironmentVariables();

const kinesisfirehoseutilities = require('../lib/kinesis-firehose-utilities');

function setEnvironmentVariables(){

    process.env.SIX_VERBOSE = 2;
    process.env.aws_region = 'us-east-1';

}

function weightedRand(spec) {
  var i, sum=0, r=random.randomInt();

  for (i in spec) {
    sum += spec[i];
    if (r <= sum) return i;
  }
}


function createRandomRebillQueueRecord(){

    let spoofed_record_seed = {
      id_rebill: uuidV4(),
      account: uuidV4(),
      previous_queuename : '',
      current_queuename: 'bill',
      datetime: timestamp.getISO8601()
    };

    let spoofed_record_list = [];

    spoofed_record_list.push(spoofed_record_seed);

    let  queue_steps = {
            bill :  { hold:0.85, fail_bill:0.15 },
            fail_bill :  { recover:0.85, exit:0.15 },
            hold :  { pending:0.85, fail_hold:0.15 },
            fail_hold :  { recover:0.85, exit:0.15 },
            pending :  { shipped:0.85, fail_pending:0.15 },
            fail_pending :  { recover:0.85, exit:0.15 },
            shipped :  { delivered:0.85, fail_shipped:0.15 },
            fail_shipped :  { recover:0.85, exit:0.15 },
            delivered :  { exit:0.85, fail_delivered:0.15 },
            fail_delivered :  { recover:0.85, exit:0.15 },
            recover : {hold:0.85, exit:0.15 }
          };


    while(spoofed_record_list[spoofed_record_list.length-1].current_queuename != 'exit'){
      let spoofed_record = {};

      spoofed_record.id_rebill = spoofed_record_seed.id_rebill ;
      spoofed_record.account = spoofed_record_seed.account ;
      spoofed_record.previous_queuename = spoofed_record_list[spoofed_record_list.length-1].current_queuename ;
      spoofed_record.previous_queuename = spoofed_record_list[spoofed_record_list.length-1].current_queuename ;
      spoofed_record.datetime = spoofed_record_list[spoofed_record_list.length-1].datetime + random.randomInt(0,100) ;

    }

    /*du.debug('Spoofed Record:', spoofed_record);*/

    return null;

}


return createRandomRebillQueueRecord();
/*return kinesisfirehoseutilities.putRecord('rebills', createRandomRebillQueueRecord()).then((result) => {
    du.output('Kinesis Firehose Result', result);
    return result;
})
.catch((error) => {
    du.warning('Error:', error);
});*/
