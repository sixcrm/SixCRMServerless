'use strict'

const mockery = require('mockery');
let chai = require('chai');

let expect = chai.expect;
let objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

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

      //Technical Debt:  Bad to make hard references to the config like this...
      expect(topic_arn).to.equal('arn:aws:sns:'+global.SixCRM.configuration.site_config.aws.region+':'+global.SixCRM.configuration.site_config.aws.account+':events');

    });

  });

  describe('createPublishParameters', () => {

    PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');

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

    it('succesfully creates publishing parameters with message attributes', () => {

      const EventHelperController = global.SixCRM.routes.include('helpers','events/Event.js');
      let eventHelperController = new EventHelperController();

      let input_object = {
        event_type: 'initial_order',
        context: {
          something: 'isnice'
        },
        message_attributes: {
          'event_type':{
            DataType: 'String',
            StringValue: 'initial_order'
          }
        }
      };

      let expected_response = {
        user: global.user.id,
        account: global.account,
        event_type: input_object.event_type,
        context: input_object.context
      };

      let expected_message_attributes = {
        'event_type': {
          DataType: 'String',
          StringValue: 'initial_order'
        }
      };

      let parameters = eventHelperController.createPublishParameters(input_object);

      expect(parameters).to.have.property('Message');
      expect(parameters).to.have.property('TopicArn');
      expect(parameters).to.have.property('MessageAttributes');
      expect(parameters.Message).to.equal(JSON.stringify(expected_response));
      expect(parameters.MessageAttributes).to.deep.equal(expected_message_attributes);

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
        },
        getRegion(){
          return 'us-east-1';
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
