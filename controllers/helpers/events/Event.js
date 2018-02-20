'use strict'

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');

module.exports = class EventHelperController {

  constructor(){

    this.snsutilities = global.SixCRM.routes.include('lib','sns-utilities.js');

    this.topic_arn = 'arn:aws:sns:{{region}}:{{account}}:events';

  }

  pushEvent(){

    du.debug('Push Event');

    let parameters = this.createPublishParameters(arguments[0]);

    return this.snsutilities.publish(parameters);

  }

  createPublishParameters({event_type, context}){

    du.debug('Create Publish Parameters');

    return {
      Message: JSON.stringify({
        user: global.user,
        account: global.account,
        event_type: event_type,
        context: context
      }),
      TopicArn: this.parseTopicARN()
    };

  }

  parseTopicARN(){

    du.debug('Parse Topic ARN');

    return parserutilities.parse(this.topic_arn, {
      account: global.SixCRM.configuration.site_config.aws.account,
      region: global.SixCRM.configuration.site_config.aws.region
    });

  }


}
