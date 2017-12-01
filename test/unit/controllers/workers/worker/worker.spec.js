const fs = require('fs');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');
const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');
const modelgenerator = global.SixCRM.routes.include('test', 'model-generator.js');


function getValidMessage(){
    return {
        MessageId: "f0b56385-ff0d-46d9-8faa-328c0f65ad1a",
        ReceiptHandle: "AQEBLc9SRWGv/P/zAExqfkmxxEN2LK7SSeKwz0OyJ5CejQvVC+gBQuvKA0xmq7yC11vwk6jOSaznBTJWILtl1ceayFDYBM9kSLKcnlJlz8/Y5qXuricdeV8LTdPIqFKUeHCr4FLEsT9F1uFDsEduIw6ZTT/2Pya5Y5YaMwY+Uvg1z1UYQ7IcUDHDJk6RGzmoEL42CsSUqIBwxrfKGQ7GkwzJ0Xv4CgAl7Jmd7d44BR2+Y3vgfauSTSVze9ao8tQ71VpsX2dqBfpJK89wpjgtKU7UG/oG/2BeavIirNi9LkzjXXxiHQvrJXSYyREK2J7Eo+iUehctCsNIZYUzF8ubrzOH0NZG80D1ZJZj6vywtE0NQsQT5TbY80ugcDMSNUV8K7IgusvY0p57U7WN1r/GJ40czg==",
        MD5OfBody: "d9e803e2c0e1752dcf57050a2b94f5d9",
        Body: JSON.stringify({id: uuidV4()})
    }
}

function getValidSession(){

  return {
    completed: false,
    subaffiliate_5: '45f025bb-a9dc-45c7-86d8-d4b7a4443426',
    created_at: '2017-04-06T18:40:41.405Z',
    subaffiliate_2: '22524f47-9db7-42f9-9540-d34a8909b072',
    subaffiliate_1: '6b6331f6-7f84-437a-9ac6-093ba301e455',
    subaffiliate_4: 'd515c0df-f9e4-4a87-8fe8-c53dcace0995',
    subaffiliate_3: 'fd2548db-66a8-481e-aacc-b2b76a88fea7',
    product_schedules: [ '12529a17-ac32-4e46-b05b-83862843055d' ],
    updated_at: '2017-04-06T18:41:12.521Z',
    affiliate: '332611c7-8940-42b5-b097-c49a765e055a',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    customer: '24f7c851-29d4-4af9-87c5-0298fa74c689',
    campaign: '70a6689a-5814-438b-b9fd-dd484d0812f9',
    id: '1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d',
    cid: 'fb10d33f-da7d-4765-9b2b-4e5e42287726'
  };

}

function getValidRebill(){

  return {
    id: uuidV4(),
    bill_at: "2017-04-06T18:40:41.405Z",
    account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    parentsession: uuidV4(),
    product_schedules: [uuidV4()],
    amount: 79.99,
    created_at:"2017-04-06T18:40:41.405Z",
    updated_at:"2017-04-06T18:41:12.521Z"
  };

}

describe('controllers/workers/worker', function () {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    const an_id = '7da91dc9-341b-4389-94ad-15b811996eef';

    describe('acquireRebill', () => {

        afterEach(() => {
            mockery.resetCache();
        });

        after(() => {
            mockery.deregisterAll();
        });

        it('returns rebill', () => {

          let rebill = getValidRebill();

          mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Rebill.js'), {
            get: (id) => {
              return Promise.resolve(rebill);
            }
          });

          let message = getValidMessage();

          const WorkerController = global.SixCRM.routes.include('workers', 'components/worker.js');
          let workerController = new WorkerController();

          workerController.parameters.set('message', message);

          return workerController.acquireRebill().then(result => {
            expect(workerController.parameters.store['rebill']).to.deep.equal(rebill);
            expect(result).to.be.true;
          });

        });

    });

    describe('acquireSession', () => {

        afterEach(() => {
            mockery.resetCache();
        });

        after(() => {
            mockery.deregisterAll();
        });

        it('returns rebill', () => {

          let session = getValidSession();

          mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Session.js'), {
            get: ({id}) => {
              return Promise.resolve(session);
            }
          });

          let message = getValidMessage();

          const WorkerController = global.SixCRM.routes.include('workers', 'components/worker.js');
          let workerController = new WorkerController();

          workerController.parameters.set('message', message);

          return workerController.acquireSession().then(result => {
            expect(workerController.parameters.store['session']).to.deep.equal(session);
            expect(result).to.be.true;
          });

        });

    });

});
