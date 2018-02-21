'use strict'

const mockery = require('mockery');
let chai = require('chai');

let expect = chai.expect;
let objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

describe('helpers/events/Event.spec.js', () => {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

  describe('constructor', () => {

    it('successfully constructs', () => {

      const EventHelperController = global.SixCRM.routes.include('helpers','events/Event.js');
      let eventHelperController = new EventHelperController();

      expect(objectutilities.getClassName(eventHelperController)).to.equal('EventHelperController');
    });

  });

  describe('parseTopicARN', () => {

    it('successfully generates a valid topic ARN', () => {

      const EventHelperController = global.SixCRM.routes.include('helpers','events/Event.js');
      let eventHelperController = new EventHelperController();

      let topic_arn = eventHelperController.parseTopicARN();

      expect(topic_arn).to.equal('arn:aws:sns:'+global.SixCRM.configuration.site_config.aws.region+':'+global.SixCRM.configuration.site_config.aws.account+':events');

    });

  });

  describe('createPublishParameters', () => {

    it('succesfully creates publishing parameters', () => {

      const EventHelperController = global.SixCRM.routes.include('helpers','events/Event.js');
      let eventHelperController = new EventHelperController();

      let input_object = {
        event_type: 'initial_order',
        context: {
          something: 'isnice'
        }
      };

      let expected_response = {
        user: global.user.id,
        account: global.account,
        event_type: input_object.event_type,
        context: input_object.context
      };

      let parameters = eventHelperController.createPublishParameters(input_object);

      expect(parameters).to.have.property('Message');
      expect(parameters).to.have.property('TopicArn');
      expect(parameters.Message).to.equal(JSON.stringify(expected_response));

    });

  });

  describe('pushEvent',  () => {

    it('successfully pushes a event to a SNS topic', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sns-utilities.js'), {
        publish:()=>{
          return Promise.resolve({
            MessageId: "e0701729-c444-5c95-b3dd-442caf4b8dbe",
            ResponseMetadata: {
              RequestId: "a7adb36f-c590-5fb2-89a1-e06aae9e9e99"
            }
          })
        }
      });

      const EventHelperController = global.SixCRM.routes.include('helpers','events/Event.js');
      let eventHelperController = new EventHelperController();

      let input_object = {
        event_type: 'initial_order',
        context: {
          something: 'isnice'
        }
      };

      return eventHelperController.pushEvent(input_object).then(result => {
        expect(result).to.have.property('MessageId');
        expect(result).to.have.property('ResponseMetadata');
        expect(result.ResponseMetadata).to.have.property('RequestId');
      });

    });

  });

});
