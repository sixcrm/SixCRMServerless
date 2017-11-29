'use strict';

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

const getRebill = () => {
  return {id: 'REBILL_ID'};
};

const getRebillResponseObject = (code) => {
  return {
    worker_response_object: {getCode: function() {return code}},
    message: {Body: JSON.stringify(getRebill())}
  };
};

describe('workers/forwardRebillMessage', () => {

  describe('updateRebillState', () => {

    before(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });
    });

    beforeEach(() => {
      global.SixCRM.localcache.clear('all');
    });

    afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
    });

    it('updates rebill after forwarding success message.', () => {

      let mock_rebill_helper = class {
        constructor(){}

        updateRebillState({rebill, newState, previousState, errorMessage}) {
          expect(rebill).to.deep.equal(getRebill());
          expect(previousState).to.equal('some_origin_queue');
          expect(newState).to.equal('some_destination_queue');
          expect(errorMessage).to.equal(undefined);

          return Promise.resolve(rebill);
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper);

      const compound_worker_response_object = getRebillResponseObject('success');

      const ForwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');
      const forwardRebillMessageController = new ForwardRebillMessageController(
        {
          origin_queue: 'some_origin_queue',
          destination_queue: 'some_destination_queue',
          failure_queue: 'some_fail_queue',
          error_queue: 'some_error_queue'
        }
      );

      return forwardRebillMessageController.updateRebillState(compound_worker_response_object).then((response) => {
        expect(response).to.deep.equal(compound_worker_response_object);
      })
    });

    it('updates rebill after forwarding failure message.', () => {

      let mock_rebill_helper = class {
        constructor(){}

        updateRebillState({rebill, newState, previousState, errorMessage}) {
          expect(rebill).to.deep.equal(getRebill());
          expect(previousState).to.equal('some_origin_queue');
          expect(newState).to.equal('some_fail_queue');
          expect(errorMessage).to.equal(undefined);

          return Promise.resolve(rebill);
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper);

      const compound_worker_response_object = getRebillResponseObject('fail');

      const ForwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');
      const forwardRebillMessageController = new ForwardRebillMessageController(
        {
          origin_queue: 'some_origin_queue',
          destination_queue: 'some_destination_queue',
          failure_queue: 'some_fail_queue',
          error_queue: 'some_error_queue'
        }
      );

      return forwardRebillMessageController.updateRebillState(compound_worker_response_object).then((response) => {
        expect(response).to.deep.equal(compound_worker_response_object);
      })
    });

    it('updates rebill after forwarding error message.', () => {

      let mock_rebill_helper = class {
        constructor(){}

        updateRebillState({rebill, newState, previousState, errorMessage}) {
          expect(rebill).to.deep.equal(getRebill());
          expect(previousState).to.equal('some_origin_queue');
          expect(newState).to.equal('some_error_queue');
          expect(errorMessage).to.equal(undefined);

          return Promise.resolve(rebill);
        }
      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper);

      const compound_worker_response_object = getRebillResponseObject('error');

      const ForwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');
      const forwardRebillMessageController = new ForwardRebillMessageController(
        {
          origin_queue: 'some_origin_queue',
          destination_queue: 'some_destination_queue',
          failure_queue: 'some_fail_queue',
          error_queue: 'some_error_queue'
        }
      );

      return forwardRebillMessageController.updateRebillState(compound_worker_response_object).then((response) => {
        expect(response).to.deep.equal(compound_worker_response_object);
      })
    });

  });

});
