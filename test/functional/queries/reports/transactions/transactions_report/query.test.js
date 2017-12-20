const expect = require('chai').expect;
const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

xdescribe('queries/transactions query', function () {

    let query_input = { analyticsfilter:
                        { start: '2017-01-01T00:00:00.000Z',
                          end: '2017-01-13T00:00:00.000Z' },
                          pagination: { limit: 10, order: 'asc', offset: 0 } };

    it('Expect to return at one row based on test seed data', () => {
      global.account = '99999999-999e-44aa-999e-aaa9a99a9999';
      global.user = 'admin.user@test.com';

      PermissionTestGenerators.givenUserWithAllowed('getTransactionsReport', 'analytics');

      return analyticsController.executeAnalyticsFunction(query_input, 'getTransactionsReport').then((result) => {

        console.log(result);

        expect(result.transactions).to.deep.equal([ { id: 'd26c1887-7ad4-4a44-be0b-e80dbce22774',
          datetime: '2017-01-02T17:40:41.405Z',
          customer: '24f7c851-29d4-4af9-87c5-0298fa74c689',
          merchant_provider: '6c40761d-8919-4ad6-884d-6a46a776cfb9',
          campaign: '70a6689a-5814-438b-b9fd-dd484d0812f9',
          affiliate: '6b6331f6-7f84-437a-9ac6-093ba301e455',
          amount: '139.99',
          processor_result: 'success',
          transaction_type: 'new',
          cycle: null,
          recycle: null,
          gateway_response: null,
          transaction_id_gateway: null } ]);
      });
    });

});
