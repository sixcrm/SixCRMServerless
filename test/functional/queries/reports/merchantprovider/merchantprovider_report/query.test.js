const expect = require('chai').expect;
const analyticsController = global.SixCRM.routes.include('controllers', 'analytics/Analytics.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

xdescribe('queries/reports/merchantprovider/merchantprovider_report query', function () {

    let query_input = { analyticsfilter:
                        { start: '2017-01-01T00:00:00.000Z',
                          end: '2017-01-13T00:00:00.000Z' },
                          pagination: { limit: 10, order: 'asc', offset: 0 } };

    it('Expect to return at least one row based on test seed data', () => {
      global.account = '99999999-999e-44aa-999e-aaa9a99a9999';
      global.user = 'admin.user@test.com';

      PermissionTestGenerators.givenUserWithAllowed('getMerchantReport', 'analytics');

      return analyticsController.executeAnalyticsFunction(query_input, 'getMerchantReport').then((result) => {

        expect(result.merchants).to.deep.equal([{ merchant_provider: '6c40761d-8919-4ad6-884d-6a46a776cfb9',
              sale_count: '1',
              sale_gross_revenue: '139.99',
              refund_expenses: '0',
              refund_count: '0',
              net_revenue: undefined,
              mtd_sales_count: '0',
              mtd_gross_count: '0' }]);
      });
    });

});
