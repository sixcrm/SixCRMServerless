const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');

xdescribe('Notification Events', () => {

  describe('correctly executes', async () => {

    it('successfully executes notifications on pushEvent', async () => {

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
  			publish() {
  				return Promise.resolve({});
  			}
  			getRegion() {
  				return 'us-east-1';
  			}
  		});

      let test_event = {
        event_type: 'test',
        context: {}
      };

      const EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
      let result = await new EventPushHelperController(test_event);
      console.log(result);

    });

  });

});
