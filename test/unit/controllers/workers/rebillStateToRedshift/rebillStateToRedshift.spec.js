'use strict';

const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');
const timestamp = global.SixCRM.routes.include('lib','timestamp.js');

function getValidRebillsDynamoResponse(count){

  const response = {rebills: []};

  for (let i = 0; i < count; i++) {
    response.rebills.push({
      id: uuidV4(),
      bill_at: "2017-04-06T18:40:41.405Z",
      account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
      parentsession: uuidV4(),
      product_schedules: [uuidV4()],
      amount: 79.99,
      created_at:"2017-04-06T18:40:41.405Z",
      updated_at:"2017-04-06T18:41:12.521Z",
      state: "current_queue",
      previous_state: "previous_queue",
      state_changed_at: "2017-09-06T18:41:12.521Z",
    })
  }

  return response;

}

function getInvalidRebillsDynamoResponse(count){

  const response = {rebills: []};

  for (let i = 0; i < count; i++) {
    response.rebills.push({
      id: uuidV4(),
      bill_at: "2017-04-06T18:40:41.405Z",
      account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
      parentsession: uuidV4(),
      product_schedules: [uuidV4()],
      amount: 79.99,
      created_at:"2017-04-06T18:40:41.405Z",
      updated_at:"2017-04-06T18:41:12.521Z",
      state_changed_at: "2017-09-06T18:41:12.521Z",
    })
  }

  return response;

}

describe.only('controllers/workers/rebillStateToRedshift', () => {

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


  describe('execute', () => {

    it('sends no rebills data when no rebills found', () => {
      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord:({table, object}) => {
          expect.fail();
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
        listByState:({state, state_changed_after, state_changed_before}) => {
          return Promise.resolve(getValidRebillsDynamoResponse(0));
        }
      });

      let RebillStateToRedshiftController = global.SixCRM.routes.include('controllers', 'workers/rebillStateToRedshift.js');
      let rebillStateToRedshiftController = new RebillStateToRedshiftController();

      return rebillStateToRedshiftController.execute().then(result => {
        expect(result).to.equal('No Data Uploaded');
      })
    });

    it('sends no rebills data when rebills found equals to null', () => {
      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord:({table, object}) => {
          expect.fail();
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
        listByState:({state, state_changed_after, state_changed_before}) => {
          return Promise.resolve({rebills: null});
        }
      });

      let RebillStateToRedshiftController = global.SixCRM.routes.include('controllers', 'workers/rebillStateToRedshift.js');
      let rebillStateToRedshiftController = new RebillStateToRedshiftController();

      return rebillStateToRedshiftController.execute().then(result => {
        expect(result).to.equal('No Data Uploaded');
      })
    });

    it('fails when rebill format is not valid for transformation', () => {
      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord:({table, object}) => {
          expect.fail();
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
        listByState:({state, state_changed_after, state_changed_before}) => {
          return Promise.resolve(getInvalidRebillsDynamoResponse(4));
        }
      });

      let RebillStateToRedshiftController = global.SixCRM.routes.include('controllers', 'workers/rebillStateToRedshift.js');
      let rebillStateToRedshiftController = new RebillStateToRedshiftController();

      return rebillStateToRedshiftController.execute().then(() => {
        expect.fail();
      }).catch(error => {
        expect(error.message).to.have.string('[500] One or more validation errors occurred:')
      })
    });

    it('sends rebills data when one rebill found', () => {
      let putRecordNumberOfCalls = 0;

      mockery.registerMock(global.SixCRM.routes.path('lib', 'timestamp.js'), {
        getLastHourInISO8601:() => {
          return 'last_hour';
        },
        getThisHourInISO8601:() => {
          return 'this_hour';
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord:(table, object) => {
          expect(table).to.equal('rebills');
          putRecordNumberOfCalls++;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
        listByState:({state, state_changed_after, state_changed_before}) => {
          expect(state).to.equal(undefined);
          expect(state_changed_after).to.equal('last_hour');
          expect(state_changed_before).to.equal('this_hour');

          return Promise.resolve(getValidRebillsDynamoResponse(1));
        }
      });

      let RebillStateToRedshiftController = global.SixCRM.routes.include('controllers', 'workers/rebillStateToRedshift.js');
      let rebillStateToRedshiftController = new RebillStateToRedshiftController();

      return rebillStateToRedshiftController.execute().then(result => {
        expect(result).to.equal('Rebills State Data Uploaded.');
        expect(putRecordNumberOfCalls).to.equal(1);
      })
    });

    it('sends rebills data when multiple rebills found', () => {
      let putRecordNumberOfCalls = 0;

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord:(table, object) => {
          expect(table).to.equal('rebills');
          putRecordNumberOfCalls++;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
        listByState:() => {
          return Promise.resolve(getValidRebillsDynamoResponse(4));
        }
      });

      let RebillStateToRedshiftController = global.SixCRM.routes.include('controllers', 'workers/rebillStateToRedshift.js');
      let rebillStateToRedshiftController = new RebillStateToRedshiftController();

      return rebillStateToRedshiftController.execute().then(result => {
        expect(result).to.equal('Rebills State Data Uploaded.');
        expect(putRecordNumberOfCalls).to.equal(4);
      })
    });

  });

});
